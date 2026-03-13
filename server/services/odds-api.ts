import type { LeagueId, GameOdds } from "@shared/schema";

// Map app league IDs to the-odds-api sport keys
const LEAGUE_TO_SPORT_KEY: Partial<Record<LeagueId, string>> = {
  nba: "basketball_nba",
  nfl: "americanfootball_nfl",
  mlb: "baseball_mlb",
  nhl: "icehockey_nhl",
  wnba: "basketball_wnba",
  mls: "soccer_usa_mls",
  "ncaa-football": "americanfootball_ncaaf",
  "ncaa-basketball": "basketball_ncaab",
  "ncaa-womens-basketball": "basketball_wncaab",
  "premier-league": "soccer_epl",
  "la-liga": "soccer_spain_la_liga",
  "bundesliga": "soccer_germany_bundesliga",
  "serie-a": "soccer_italy_serie_a",
  "ligue-1": "soccer_france_ligue_one",
};

// Preferred bookmaker priority
const PREFERRED_BOOKMAKERS = [
  "fanduel",
  "draftkings",
  "betmgm",
  "pointsbetus",
  "bovada",
];

// Raw API response types
interface OddsOutcome {
  name: string;
  price: number;
  point?: number;
}

interface OddsMarket {
  key: string;
  last_update: string;
  outcomes: OddsOutcome[];
}

interface OddsBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: OddsMarket[];
}

interface OddsEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsBookmaker[];
}

// Per-league cache
const oddsCache = new Map<string, { data: OddsEvent[]; fetchedAt: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const ODDS_API_BASE = "https://api.the-odds-api.com/v4/sports";

function selectBookmaker(bookmakers: OddsBookmaker[]): OddsBookmaker | null {
  for (const key of PREFERRED_BOOKMAKERS) {
    const found = bookmakers.find((b) => b.key === key);
    if (found) return found;
  }
  return bookmakers[0] || null;
}

function transformEvent(event: OddsEvent): GameOdds | null {
  const bookmaker = selectBookmaker(event.bookmakers);
  if (!bookmaker) return null;

  const h2h = bookmaker.markets.find((m) => m.key === "h2h");
  const spreads = bookmaker.markets.find((m) => m.key === "spreads");
  const totals = bookmaker.markets.find((m) => m.key === "totals");

  const odds: GameOdds = {
    homeTeam: event.home_team,
    awayTeam: event.away_team,
    commenceTime: event.commence_time,
    bookmaker: bookmaker.title,
    lastUpdate: bookmaker.last_update,
  };

  if (h2h) {
    const home = h2h.outcomes.find((o) => o.name === event.home_team);
    const away = h2h.outcomes.find((o) => o.name === event.away_team);
    const draw = h2h.outcomes.find((o) => o.name === "Draw");
    if (home && away) {
      odds.moneyline = {
        home: home.price,
        away: away.price,
        ...(draw ? { draw: draw.price } : {}),
      };
    }
  }

  if (spreads) {
    const home = spreads.outcomes.find((o) => o.name === event.home_team);
    const away = spreads.outcomes.find((o) => o.name === event.away_team);
    if (home && away && home.point !== undefined && away.point !== undefined) {
      odds.spread = {
        home: home.point,
        homePrice: home.price,
        away: away.point,
        awayPrice: away.price,
      };
    }
  }

  if (totals) {
    const over = totals.outcomes.find((o) => o.name === "Over");
    const under = totals.outcomes.find((o) => o.name === "Under");
    if (over && under && over.point !== undefined && under.point !== undefined) {
      odds.total = {
        over: over.point,
        overPrice: over.price,
        under: under.point,
        underPrice: under.price,
      };
    }
  }

  return odds;
}

export async function fetchOddsForLeague(leagueId: LeagueId): Promise<GameOdds[]> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    console.warn("ODDS_API_KEY not configured");
    return [];
  }

  const sportKey = LEAGUE_TO_SPORT_KEY[leagueId];
  if (!sportKey) return [];

  // Check cache
  const cached = oddsCache.get(leagueId);
  if (cached && Date.now() - cached.fetchedAt < CACHE_DURATION) {
    return cached.data.map(transformEvent).filter((o): o is GameOdds => o !== null);
  }

  try {
    const url = new URL(`${ODDS_API_BASE}/${sportKey}/odds`);
    url.searchParams.set("apiKey", apiKey);
    url.searchParams.set("regions", "us");
    url.searchParams.set("markets", "h2h,spreads,totals");
    url.searchParams.set("oddsFormat", "american");
    url.searchParams.set("dateFormat", "iso");

    const response = await fetch(url.toString());

    // Log quota usage
    const remaining = response.headers.get("x-requests-remaining");
    const used = response.headers.get("x-requests-used");
    if (remaining !== null) {
      console.log(`Odds API quota: ${used} used, ${remaining} remaining`);
    }

    if (!response.ok) {
      console.error(`Odds API error for ${leagueId}: ${response.status}`);
      // Return stale cache if available
      if (cached) {
        return cached.data.map(transformEvent).filter((o): o is GameOdds => o !== null);
      }
      return [];
    }

    const events: OddsEvent[] = await response.json();

    // Cache raw events
    oddsCache.set(leagueId, { data: events, fetchedAt: Date.now() });

    return events.map(transformEvent).filter((o): o is GameOdds => o !== null);
  } catch (error) {
    console.error(`Error fetching odds for ${leagueId}:`, error);
    // Return stale cache if available
    if (cached) {
      return cached.data.map(transformEvent).filter((o): o is GameOdds => o !== null);
    }
    return [];
  }
}
