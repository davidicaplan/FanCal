import type { Game, LeagueId } from "@shared/schema";
import { teamsData } from "./teams";
import { format, addDays } from "date-fns";

function generateGames(): Game[] {
  const games: Game[] = [];
  const today = new Date();
  let gameId = 1;

  const teamsByLeague: Record<string, string[]> = {};
  teamsData.forEach((team) => {
    if (!teamsByLeague[team.leagueId]) {
      teamsByLeague[team.leagueId] = [];
    }
    teamsByLeague[team.leagueId].push(team.id);
  });

  const venues: Record<string, string[]> = {
    nba: ["Madison Square Garden", "Staples Center", "United Center", "TD Garden", "Chase Center", "Crypto.com Arena"],
    nfl: ["SoFi Stadium", "Arrowhead Stadium", "AT&T Stadium", "Allegiant Stadium", "Lambeau Field", "MetLife Stadium"],
    mlb: ["Yankee Stadium", "Dodger Stadium", "Fenway Park", "Wrigley Field", "Oracle Park", "Minute Maid Park"],
    nhl: ["Madison Square Garden", "TD Garden", "United Center", "Crypto.com Arena", "T-Mobile Arena", "Rogers Arena"],
    "ncaa-football": ["Michigan Stadium", "Ohio Stadium", "Bryant-Denny Stadium", "Neyland Stadium", "Rose Bowl", "Death Valley"],
    "ncaa-basketball": ["Allen Fieldhouse", "Cameron Indoor Stadium", "Rupp Arena", "Dean Smith Center", "Gampel Pavilion"],
    "premier-league": ["Emirates Stadium", "Etihad Stadium", "Anfield", "Old Trafford", "Stamford Bridge", "Tottenham Hotspur Stadium"],
    "la-liga": ["Santiago Bernabeu", "Camp Nou", "Wanda Metropolitano", "Sanchez-Pizjuan", "San Mames"],
  };

  const times = ["12:00 PM", "1:00 PM", "2:30 PM", "3:00 PM", "4:00 PM", "5:00 PM", "7:00 PM", "7:30 PM", "8:00 PM", "9:00 PM"];

  Object.entries(teamsByLeague).forEach(([leagueId, teamIds]) => {
    const leagueVenues = venues[leagueId] || ["Stadium"];
    
    for (let dayOffset = 0; dayOffset <= 30; dayOffset++) {
      const gamesPerDay = Math.floor(Math.random() * 4) + 1;
      
      for (let g = 0; g < gamesPerDay; g++) {
        const shuffled = [...teamIds].sort(() => Math.random() - 0.5);
        const homeTeamId = shuffled[0];
        const awayTeamId = shuffled[1];
        
        if (!homeTeamId || !awayTeamId) continue;

        const gameDate = addDays(today, dayOffset);
        const time = times[Math.floor(Math.random() * times.length)];
        const venue = leagueVenues[Math.floor(Math.random() * leagueVenues.length)];

        const isPast = dayOffset < 0;
        const status = isPast ? "final" : "scheduled";

        const game: Game = {
          id: `game-${gameId++}`,
          homeTeamId,
          awayTeamId,
          leagueId: leagueId as LeagueId,
          date: format(gameDate, "yyyy-MM-dd"),
          time,
          venue,
          status,
        };

        if (status === "final") {
          game.homeScore = Math.floor(Math.random() * 120) + 70;
          game.awayScore = Math.floor(Math.random() * 120) + 70;
        }

        games.push(game);
      }
    }
  });

  return games.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });
}

export const gamesData = generateGames();

export function getGamesByDateRange(startDate: string, endDate: string): Game[] {
  return gamesData.filter((game) => game.date >= startDate && game.date <= endDate);
}

export function getGamesByTeam(teamId: string): Game[] {
  return gamesData.filter((game) => game.homeTeamId === teamId || game.awayTeamId === teamId);
}

export function getGamesByLeague(leagueId: string): Game[] {
  return gamesData.filter((game) => game.leagueId === leagueId);
}
