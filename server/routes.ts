import type { Express } from "express";
import { createServer, type Server } from "http";
import { teamsData, getTeamsByLeague } from "./data/teams";
import { fetchAllGames } from "./services/espn-api";
import { leagues } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
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

  return httpServer;
}
