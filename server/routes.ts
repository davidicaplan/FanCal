import type { Express } from "express";
import { createServer, type Server } from "http";
import { teamsData, getTeamsByLeague } from "./data/teams";
import { gamesData, getGamesByLeague, getGamesByTeam } from "./data/games";
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

  app.get("/api/games", (req, res) => {
    const { leagueId, teamId, startDate, endDate } = req.query;
    
    let filtered = [...gamesData];
    
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
  });

  app.get("/api/games/:gameId", (req, res) => {
    const { gameId } = req.params;
    const game = gamesData.find((g) => g.id === gameId);
    
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    
    res.json(game);
  });

  return httpServer;
}
