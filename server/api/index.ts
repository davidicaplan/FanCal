import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Import server modules
import { teamsData, getTeamsByLeague } from "../data/teams";
import { fetchAllGames } from "../services/espn-api";
import { leagues, userSelections, userSelectionSchema } from "../../shared/schema";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "../auth";
import { db } from "../db";
import { eq } from "drizzle-orm";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup auth
let authSetup = false;
async function ensureAuth() {
  if (!authSetup) {
    await setupAuth(app);
    registerAuthRoutes(app);
    authSetup = true;
  }
}

// API Routes
app.get("/api/leagues", (_req, res) => {
  res.json(leagues);
});

app.get("/api/teams/all", (_req, res) => {
  res.json(teamsData);
});

app.get("/api/teams/:leagueId", (req, res) => {
  const { leagueId } = req.params;
  const teams = getTeamsByLeague(leagueId);
  res.json(teams);
});

app.get("/api/games", async (req, res) => {
  try {
    const { leagueId, teamId, startDate, endDate } = req.query;

    const allGames = await fetchAllGames();
    let filtered = [...allGames];

    if (leagueId && typeof leagueId === "string") {
      filtered = filtered.filter((game) => game.leagueId === leagueId);
    }

    if (teamId && typeof teamId === "string") {
      filtered = filtered.filter(
        (game) => game.homeTeamId === teamId || game.awayTeamId === teamId
      );
    }

    if (startDate && typeof startDate === "string") {
      filtered = filtered.filter((game) => game.date >= startDate);
    }

    if (endDate && typeof endDate === "string") {
      filtered = filtered.filter((game) => game.date <= endDate);
    }

    res.json(filtered);
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ error: "Failed to fetch games" });
  }
});

app.get("/api/games/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;
    const allGames = await fetchAllGames();
    const game = allGames.find((g) => g.id === gameId);

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({ error: "Failed to fetch game" });
  }
});

app.get("/api/user/selections", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const [selections] = await db
      .select()
      .from(userSelections)
      .where(eq(userSelections.userId, userId));

    if (!selections) {
      return res.json({
        selectedTeams: {},
        leagueVisibility: {
          nba: true,
          nfl: true,
          mlb: true,
          nhl: true,
          "ncaa-football": true,
          "ncaa-basketball": true,
          "premier-league": true,
          "la-liga": true,
          "bundesliga": true,
          "serie-a": true,
          "ligue-1": true,
        },
      });
    }

    res.json({
      selectedTeams: selections.selectedTeams,
      leagueVisibility: selections.leagueVisibility,
    });
  } catch (error) {
    console.error("Error fetching user selections:", error);
    res.status(500).json({ error: "Failed to fetch selections" });
  }
});

app.post("/api/user/selections", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    const parseResult = userSelectionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid selection data", details: parseResult.error.issues });
    }

    const { selectedTeams, leagueVisibility } = parseResult.data;

    const [existing] = await db
      .select()
      .from(userSelections)
      .where(eq(userSelections.userId, userId));

    if (existing) {
      await db
        .update(userSelections)
        .set({
          selectedTeams,
          leagueVisibility,
          updatedAt: new Date(),
        })
        .where(eq(userSelections.userId, userId));
    } else {
      await db.insert(userSelections).values({
        userId,
        selectedTeams,
        leagueVisibility,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving user selections:", error);
    res.status(500).json({ error: "Failed to save selections" });
  }
});

// Export handler for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureAuth();
  return app(req as any, res as any);
}
