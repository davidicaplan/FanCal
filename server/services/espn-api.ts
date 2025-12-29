import type { Game, LeagueId } from "@shared/schema";

interface ESPNEvent {
  id: string;
  date: string;
  name: string;
  shortName: string;
  competitions: Array<{
    id: string;
    date: string;
    venue?: { fullName: string; city?: string };
    competitors: Array<{
      id: string;
      homeAway: "home" | "away";
      team: {
        id: string;
        name: string;
        abbreviation: string;
        displayName: string;
      };
      score?: string;
    }>;
    status: {
      type: { name: string; completed: boolean };
    };
    broadcasts?: Array<{ names: string[] }>;
  }>;
}

interface ESPNScoreboard {
  events: ESPNEvent[];
}

const ESPN_ENDPOINTS: Record<string, string> = {
  nba: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
  nfl: "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",
  mlb: "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard",
  nhl: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard",
  wnba: "https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard",
  mls: "https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard",
  ncaaf: "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard",
  ncaab: "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard",
  ncaaw: "https://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/scoreboard",
  epl: "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard",
  laliga: "https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard",
  bundesliga: "https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard",
  seriea: "https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard",
  ligue1: "https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard",
};

const LEAGUE_ID_MAP: Record<string, string> = {
  nba: "nba",
  nfl: "nfl",
  mlb: "mlb",
  nhl: "nhl",
  wnba: "wnba",
  mls: "mls",
  ncaaf: "ncaa-football",
  ncaab: "ncaa-basketball",
  ncaaw: "ncaa-womens-basketball",
  epl: "premier-league",
  laliga: "la-liga",
  bundesliga: "bundesliga",
  seriea: "serie-a",
  ligue1: "ligue-1",
};

let cachedGames: Game[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for extended date range

function parseESPNDate(dateStr: string): { date: string; time: string } {
  const dt = new Date(dateStr);
  
  // Format date in PST timezone to avoid off-by-one-day issues
  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Los_Angeles",
  });
  const date = dateFormatter.format(dt);
  
  const time = dt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Los_Angeles",
  });
  return { date, time };
}

function mapESPNEventToGame(event: ESPNEvent, leagueId: LeagueId): Game | null {
  const competition = event.competitions[0];
  if (!competition) return null;

  const homeTeam = competition.competitors.find((c) => c.homeAway === "home");
  const awayTeam = competition.competitors.find((c) => c.homeAway === "away");

  if (!homeTeam || !awayTeam) return null;

  const { date, time } = parseESPNDate(event.date);
  const status = competition.status.type.completed
    ? "final"
    : competition.status.type.name === "STATUS_IN_PROGRESS"
    ? "live"
    : "scheduled";

  const broadcast = competition.broadcasts?.[0]?.names?.[0] || undefined;

  return {
    id: `${leagueId}-${event.id}`,
    leagueId,
    homeTeamId: `${leagueId}-${homeTeam.team.abbreviation.toLowerCase()}`,
    awayTeamId: `${leagueId}-${awayTeam.team.abbreviation.toLowerCase()}`,
    homeTeamName: homeTeam.team.displayName,
    awayTeamName: awayTeam.team.displayName,
    date,
    time,
    venue: competition.venue?.fullName,
    homeScore: homeTeam.score ? parseInt(homeTeam.score, 10) : undefined,
    awayScore: awayTeam.score ? parseInt(awayTeam.score, 10) : undefined,
    status: status as "scheduled" | "live" | "final",
    broadcast,
  };
}

async function fetchLeagueSchedule(
  espnKey: string,
  leagueId: LeagueId,
  dates?: string
): Promise<Game[]> {
  const endpoint = ESPN_ENDPOINTS[espnKey];
  if (!endpoint) return [];

  try {
    const url = new URL(endpoint);
    if (dates) {
      url.searchParams.set("dates", dates);
    }

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(`ESPN API error for ${espnKey}: ${response.status}`);
      return [];
    }

    const data: ESPNScoreboard = await response.json();
    const games: Game[] = [];

    for (const event of data.events || []) {
      const game = mapESPNEventToGame(event, leagueId);
      if (game) {
        games.push(game);
      }
    }

    return games;
  } catch (error) {
    console.error(`Error fetching ${espnKey} schedule:`, error);
    return [];
  }
}

function getDateRange(): string[] {
  const dates: string[] = [];
  const today = new Date();

  // Get games for past 3 months and next 3 months (approximately 90 days each)
  for (let i = -90; i <= 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split("T")[0].replace(/-/g, ""));
  }

  return dates;
}

export async function fetchAllGames(): Promise<Game[]> {
  const now = Date.now();

  // Return cached data if still valid
  if (cachedGames.length > 0 && now - lastFetchTime < CACHE_DURATION) {
    return cachedGames;
  }

  console.log("Fetching fresh game data from ESPN...");

  const leagueMapping: Array<{ espnKey: string; leagueId: LeagueId }> = [
    { espnKey: "nba", leagueId: "nba" },
    { espnKey: "nfl", leagueId: "nfl" },
    { espnKey: "mlb", leagueId: "mlb" },
    { espnKey: "nhl", leagueId: "nhl" },
    { espnKey: "wnba", leagueId: "wnba" },
    { espnKey: "mls", leagueId: "mls" },
    { espnKey: "ncaaf", leagueId: "ncaa-football" },
    { espnKey: "ncaab", leagueId: "ncaa-basketball" },
    { espnKey: "ncaaw", leagueId: "ncaa-womens-basketball" },
    { espnKey: "epl", leagueId: "premier-league" },
    { espnKey: "laliga", leagueId: "la-liga" },
    { espnKey: "bundesliga", leagueId: "bundesliga" },
    { espnKey: "seriea", leagueId: "serie-a" },
    { espnKey: "ligue1", leagueId: "ligue-1" },
  ];

  // Fetch all dates for complete 6-month coverage
  const dateRange = getDateRange();
  const allGames: Game[] = [];

  // Fetch from all leagues - process in batches to avoid overwhelming ESPN
  const fetchPromises = leagueMapping.flatMap(({ espnKey, leagueId }) =>
    dateRange.map((date) => fetchLeagueSchedule(espnKey, leagueId, date))
  );

  const results = await Promise.all(fetchPromises);

  for (const games of results) {
    allGames.push(...games);
  }

  // Deduplicate games by ID
  const uniqueGames = Array.from(
    new Map(allGames.map((g) => [g.id, g])).values()
  );

  // Sort by date and time
  uniqueGames.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return (a.time || "").localeCompare(b.time || "");
  });

  cachedGames = uniqueGames;
  lastFetchTime = now;

  console.log(`Fetched ${uniqueGames.length} games from ESPN`);

  return uniqueGames;
}

export function getLeagueIdFromESPN(espnKey: string): string {
  return LEAGUE_ID_MAP[espnKey] || espnKey;
}
