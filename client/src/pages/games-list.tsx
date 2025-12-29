import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { GameCard } from "@/components/game-card";
import { useTeamSelection } from "@/lib/team-selection-context";
import { leagues, type Game, type Team } from "@shared/schema";
import { Calendar, Filter, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO, isToday, addDays, isBefore, isAfter, startOfDay, endOfDay } from "date-fns";

type DateFilter = "all" | "today" | "this-week" | "next-week";

export default function GamesList() {
  const [dateFilter, setDateFilter] = useState<DateFilter>("this-week");
  const [leagueFilter, setLeagueFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");

  const { selectedTeams, leagueVisibility, getTotalSelectedTeams } = useTeamSelection();
  const totalSelected = getTotalSelectedTeams();

  const { data: games = [], isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: [`/api/games`],
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: [`/api/teams/all`],
  });

  // Map teams by ESPN-style ID (leagueId-abbreviation) to match game team IDs
  const teamMap = useMemo(() => {
    const map = new Map<string, Team>();
    teams.forEach((team) => {
      const espnId = `${team.leagueId}-${team.abbreviation.toLowerCase()}`;
      map.set(espnId, team);
    });
    return map;
  }, [teams]);

  // Get list of user's saved teams for the filter dropdown
  const savedTeamsList = useMemo(() => {
    const teamList: Team[] = [];
    Object.entries(selectedTeams).forEach(([leagueId, teamIds]) => {
      if (leagueVisibility[leagueId] !== false) {
        teamIds.forEach((teamId) => {
          const team = teams.find((t) => t.id === teamId);
          if (team) {
            teamList.push(team);
          }
        });
      }
    });
    // Sort alphabetically by full display text (city + name + league)
    return teamList.sort((a, b) => {
      const aLeague = leagues.find(l => l.id === a.leagueId);
      const bLeague = leagues.find(l => l.id === b.leagueId);
      const aDisplay = `${a.city} ${a.name} (${aLeague?.shortName || ''})`;
      const bDisplay = `${b.city} ${b.name} (${bLeague?.shortName || ''})`;
      return aDisplay.localeCompare(bDisplay);
    });
  }, [selectedTeams, leagueVisibility, teams]);

  // Build a set of ESPN-style team IDs from selected teams
  const selectedEspnTeamIds = useMemo(() => {
    const espnIds = new Set<string>();
    Object.entries(selectedTeams).forEach(([leagueId, teamIds]) => {
      if (leagueVisibility[leagueId] !== false) {
        teamIds.forEach((teamId) => {
          const team = teams.find((t) => t.id === teamId);
          if (team) {
            // ESPN uses format: leagueId-abbreviation (lowercase)
            espnIds.add(`${leagueId}-${team.abbreviation.toLowerCase()}`);
          }
        });
      }
    });
    return espnIds;
  }, [selectedTeams, leagueVisibility, teams]);

  // Get ESPN ID for a specific team
  const getEspnTeamId = (team: Team) => {
    return `${team.leagueId}-${team.abbreviation.toLowerCase()}`;
  };

  const filteredGames = useMemo(() => {
    let filtered: Game[];
    
    // If a specific team is selected, filter only that team's games
    if (teamFilter !== "all") {
      const focusedTeam = teams.find((t) => t.id === teamFilter);
      if (focusedTeam) {
        const focusedEspnId = getEspnTeamId(focusedTeam);
        filtered = games.filter(
          (game) => game.homeTeamId === focusedEspnId || game.awayTeamId === focusedEspnId
        );
      } else {
        filtered = [];
      }
    } else {
      // Filter games where either home or away team matches any selected team
      filtered = games.filter(
        (game) =>
          selectedEspnTeamIds.has(game.homeTeamId) || selectedEspnTeamIds.has(game.awayTeamId)
      );
    }

    if (leagueFilter !== "all") {
      filtered = filtered.filter((game) => game.leagueId === leagueFilter);
    }

    const today = startOfDay(new Date());
    const endOfToday = endOfDay(new Date());
    const endOfThisWeek = endOfDay(addDays(today, 7 - today.getDay()));
    const startOfNextWeek = startOfDay(addDays(endOfThisWeek, 1));
    const endOfNextWeek = endOfDay(addDays(startOfNextWeek, 6));

    if (dateFilter === "today") {
      filtered = filtered.filter((game) => {
        const gameDate = parseISO(game.date);
        return gameDate >= today && gameDate <= endOfToday;
      });
    } else if (dateFilter === "this-week") {
      filtered = filtered.filter((game) => {
        const gameDate = parseISO(game.date);
        return gameDate >= today && gameDate <= endOfThisWeek;
      });
    } else if (dateFilter === "next-week") {
      filtered = filtered.filter((game) => {
        const gameDate = parseISO(game.date);
        return gameDate >= startOfNextWeek && gameDate <= endOfNextWeek;
      });
    }

    return filtered.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
  }, [games, selectedEspnTeamIds, leagueFilter, dateFilter, teamFilter, teams]);

  const groupedGames = useMemo(() => {
    const groups: { date: string; games: Game[] }[] = [];
    let currentDate = "";
    let currentGroup: Game[] = [];

    filteredGames.forEach((game) => {
      if (game.date !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, games: currentGroup });
        }
        currentDate = game.date;
        currentGroup = [game];
      } else {
        currentGroup.push(game);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, games: currentGroup });
    }

    return groups;
  }, [filteredGames]);

  const activeLeagues = useMemo(() => {
    return leagues.filter((league) => leagueVisibility[league.id] !== false);
  }, [leagueVisibility]);

  if (totalSelected === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <EmptyState type="no-teams" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-games-title">
            Upcoming Games
          </h1>
          <p className="text-muted-foreground">
            {filteredGames.length} game{filteredGames.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-2 flex-wrap">
          {(["all", "today", "this-week", "next-week"] as DateFilter[]).map((filter) => {
            const labels = {
              all: "All Dates",
              today: "Today",
              "this-week": "This Week",
              "next-week": "Next Week",
            };
            return (
              <Button
                key={filter}
                variant={dateFilter === filter ? "secondary" : "outline"}
                size="sm"
                onClick={() => setDateFilter(filter)}
                data-testid={`filter-${filter}`}
              >
                {labels[filter]}
              </Button>
            );
          })}
        </div>

        <Select value={leagueFilter} onValueChange={setLeagueFilter}>
          <SelectTrigger className="w-[160px]" data-testid="select-league-filter">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Leagues" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leagues</SelectItem>
            {activeLeagues.map((league) => (
              <SelectItem key={league.id} value={league.id}>
                {league.shortName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={teamFilter} onValueChange={setTeamFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-team-filter">
            <Users className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All My Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All My Teams</SelectItem>
            {savedTeamsList.map((team) => {
              const league = leagues.find((l) => l.id === team.leagueId);
              return (
                <SelectItem key={team.id} value={team.id}>
                  {team.city} {team.name} ({league?.shortName})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {gamesLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : filteredGames.length === 0 ? (
        <EmptyState
          type="no-games"
          description={
            dateFilter !== "all"
              ? "Try selecting a different date range"
              : "Check back later for scheduled games"
          }
        />
      ) : (
        <div className="space-y-8">
          {groupedGames.map(({ date, games: dateGames }) => {
            const gameDate = parseISO(date);
            const isGameToday = isToday(gameDate);
            return (
              <div key={date}>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-semibold" data-testid={`date-header-${date}`}>
                    {isGameToday ? "Today" : format(gameDate, "EEEE, MMMM d, yyyy")}
                  </h2>
                  <Badge variant="secondary">{dateGames.length}</Badge>
                </div>
                <div className="space-y-4">
                  {dateGames.map((game) => {
                    const homeTeam = teamMap.get(game.homeTeamId);
                    const awayTeam = teamMap.get(game.awayTeamId);
                    const league = leagues.find((l) => l.id === game.leagueId);
                    if (!league) return null;
                    return (
                      <GameCard
                        key={game.id}
                        game={game}
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                        league={league}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
