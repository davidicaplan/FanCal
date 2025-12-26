import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useTeamSelection } from "@/lib/team-selection-context";
import { leagues, type Game, type Team } from "@shared/schema";
import { ChevronLeft, ChevronRight, CalendarDays, List } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isToday,
} from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GameCard } from "@/components/game-card";

type ViewMode = "month" | "week";

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { selectedTeams, leagueVisibility, getTotalSelectedTeams } = useTeamSelection();
  const totalSelected = getTotalSelectedTeams();

  const { data: games = [], isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: [`/api/games`],
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: [`/api/teams/all`],
  });

  const teamMap = useMemo(() => {
    const map = new Map<string, Team>();
    teams.forEach((team) => map.set(team.id, team));
    return map;
  }, [teams]);

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

  const filteredGames = useMemo(() => {
    // Filter games where either home or away team matches a selected team
    return games.filter(
      (game) =>
        selectedEspnTeamIds.has(game.homeTeamId) || selectedEspnTeamIds.has(game.awayTeamId)
    );
  }, [games, selectedEspnTeamIds]);

  const calendarDays = useMemo(() => {
    if (viewMode === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const start = startOfWeek(monthStart, { weekStartsOn: 0 });
      const end = endOfWeek(monthEnd, { weekStartsOn: 0 });
      return eachDayOfInterval({ start, end });
    } else {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
  }, [currentDate, viewMode]);

  const gamesByDate = useMemo(() => {
    const map = new Map<string, Game[]>();
    filteredGames.forEach((game) => {
      const dateKey = game.date;
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, game]);
    });
    return map;
  }, [filteredGames]);

  const selectedDateGames = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return gamesByDate.get(dateKey) || [];
  }, [selectedDate, gamesByDate]);

  const navigatePrev = () => {
    setCurrentDate(viewMode === "month" ? subMonths(currentDate, 1) : new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const navigateNext = () => {
    setCurrentDate(viewMode === "month" ? addMonths(currentDate, 1) : new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (totalSelected === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <EmptyState type="no-teams" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-calendar-title">
            My Calendar
          </h1>
          <p className="text-muted-foreground">
            {filteredGames.length} game{filteredGames.length !== 1 ? "s" : ""} scheduled
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "month" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("month")}
              className="rounded-r-none"
              data-testid="button-month-view"
            >
              <CalendarDays className="w-4 h-4 mr-1" />
              Month
            </Button>
            <Button
              variant={viewMode === "week" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("week")}
              className="rounded-l-none"
              data-testid="button-week-view"
            >
              <List className="w-4 h-4 mr-1" />
              Week
            </Button>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-2 p-4 border-b flex-wrap">
          <Button variant="ghost" size="icon" onClick={navigatePrev} data-testid="button-prev">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold" data-testid="text-current-period">
              {viewMode === "month"
                ? format(currentDate, "MMMM yyyy")
                : `Week of ${format(startOfWeek(currentDate), "MMM d, yyyy")}`}
            </h2>
            <Button variant="outline" size="sm" onClick={goToToday} data-testid="button-today">
              Today
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={navigateNext} data-testid="button-next">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {gamesLoading ? (
          <div className="p-4">
            <Skeleton className="h-64" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 border-b">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className={`grid grid-cols-7 ${viewMode === "week" ? "min-h-[200px]" : ""}`}>
              {calendarDays.map((day, index) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const dayGames = gamesByDate.get(dateKey) || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isDayToday = isToday(day);

                return (
                  <div
                    key={index}
                    className={`border-r border-b last:border-r-0 p-2 min-h-[100px] cursor-pointer hover-elevate transition-colors ${
                      !isCurrentMonth && viewMode === "month" ? "bg-muted/30" : ""
                    } ${isDayToday ? "bg-primary/5" : ""}`}
                    onClick={() => dayGames.length > 0 && setSelectedDate(day)}
                    data-testid={`calendar-day-${dateKey}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isDayToday ? "text-primary" : !isCurrentMonth ? "text-muted-foreground" : ""}`}>
                      {format(day, "d")}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {dayGames.slice(0, 3).map((game) => {
                        const league = leagues.find((l) => l.id === game.leagueId);
                        return (
                          <div
                            key={game.id}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: league?.color || "#888" }}
                            title={`${teamMap.get(game.awayTeamId)?.abbreviation || game.awayTeamName?.slice(0, 3) || "?"} @ ${teamMap.get(game.homeTeamId)?.abbreviation || game.homeTeamName?.slice(0, 3) || "?"}`}
                          />
                        );
                      })}
                      {dayGames.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{dayGames.length - 3}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      <div className="mt-6">
        <h3 className="font-semibold mb-3">Legend</h3>
        <div className="flex flex-wrap gap-3">
          {leagues
            .filter((league) => leagueVisibility[league.id] !== false)
            .map((league) => (
              <div key={league.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: league.color }}
                />
                <span className="text-sm">{league.shortName}</span>
              </div>
            ))}
        </div>
      </div>

      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="dialog-title">
              Games on {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedDateGames.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No games scheduled</p>
            ) : (
              selectedDateGames.map((game) => {
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
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
