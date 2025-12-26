import { teamsData, getTeamsByLeague, getTeamById } from "./data/teams";
import { gamesData } from "./data/games";
import type { Team, Game, League } from "@shared/schema";
import { leagues } from "@shared/schema";

export interface IStorage {
  getLeagues(): Promise<League[]>;
  getTeams(leagueId?: string): Promise<Team[]>;
  getTeamById(teamId: string): Promise<Team | undefined>;
  getGames(filters?: { leagueId?: string; teamId?: string; startDate?: string; endDate?: string }): Promise<Game[]>;
  getGameById(gameId: string): Promise<Game | undefined>;
}

export class MemStorage implements IStorage {
  async getLeagues(): Promise<League[]> {
    return leagues;
  }

  async getTeams(leagueId?: string): Promise<Team[]> {
    if (leagueId) {
      return getTeamsByLeague(leagueId);
    }
    return teamsData;
  }

  async getTeamById(teamId: string): Promise<Team | undefined> {
    return getTeamById(teamId);
  }

  async getGames(filters?: { leagueId?: string; teamId?: string; startDate?: string; endDate?: string }): Promise<Game[]> {
    let filtered = [...gamesData];
    
    if (filters?.leagueId) {
      filtered = filtered.filter((game) => game.leagueId === filters.leagueId);
    }
    
    if (filters?.teamId) {
      filtered = filtered.filter(
        (game) => game.homeTeamId === filters.teamId || game.awayTeamId === filters.teamId
      );
    }
    
    if (filters?.startDate) {
      filtered = filtered.filter((game) => game.date >= filters.startDate!);
    }
    
    if (filters?.endDate) {
      filtered = filtered.filter((game) => game.date <= filters.endDate!);
    }
    
    return filtered;
  }

  async getGameById(gameId: string): Promise<Game | undefined> {
    return gamesData.find((g) => g.id === gameId);
  }
}

export const storage = new MemStorage();
