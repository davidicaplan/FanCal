import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useTeamSelection } from "@/lib/team-selection-context";
import { leagues, type Game, type Team } from "@shared/schema";
import { ChevronLeft, ChevronRight, CalendarDays, List, Users, CalendarPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  addDays,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GameCard } from "@/components/game-card";

type ViewMode = "month" | "week";

const ET_TIMEZONE = "America/New_York";

function isValidGameTime(time: string): boolean {
  if (!time || time.toUpperCase() === "TBD" || time.toUpperCase() === "TBA") {
    return false;
  }
  const [timePart] = time.split(" ");
  const parts = timePart.split(":");
  if (parts.length !== 2) return false;
  const [hours, minutes] = parts.map(Number);
  return !isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

function parseGameDateTime(time: string, date: string): Date | null {
  if (!isValidGameTime(time)) return null;
  
  const [timePart, period] = time.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);
  
  if (period) {
    if (period.toUpperCase() === "PM" && hours !== 12) {
      hours += 12;
    } else if (period.toUpperCase() === "AM" && hours === 12) {
      hours = 0;
    }
  }
  
  const dateTimeStr = `${date}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
  try {
    const localDate = new Date(dateTimeStr);
    const etDate = toZonedTime(localDate, ET_TIMEZONE);
    const offset = localDate.getTime() - etDate.getTime();
    return new Date(localDate.getTime() + offset);
  } catch {
    return null;
  }
}

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportRangeType, setExportRangeType] = useState<"all" | "range">("all");
  const [exportStartDate, setExportStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [exportEndDate, setExportEndDate] = useState(format(addDays(new Date(), 30), "yyyy-MM-dd"));

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
    return teamList.sort((a, b) => a.name.localeCompare(b.name));
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
    // If a specific team is selected, filter only that team's games
    if (teamFilter !== "all") {
      const focusedTeam = teams.find((t) => t.id === teamFilter);
      if (focusedTeam) {
        const focusedEspnId = getEspnTeamId(focusedTeam);
        return games.filter(
          (game) => game.homeTeamId === focusedEspnId || game.awayTeamId === focusedEspnId
        );
      }
      return [];
    }
    
    // Filter games where either home or away team matches any selected team
    return games.filter(
      (game) =>
        selectedEspnTeamIds.has(game.homeTeamId) || selectedEspnTeamIds.has(game.awayTeamId)
    );
  }, [games, selectedEspnTeamIds, teamFilter, teams]);

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

  const handleExportToCalendar = () => {
    // Get games to export based on current filter and date range
    let gamesToExport = filteredGames.filter((game) => {
      // Only export games with valid times (not TBD)
      if (!isValidGameTime(game.time)) return false;
      // Only export non-final games
      if (game.status === "final") return false;
      
      // Filter by date range if specified
      if (exportRangeType === "range") {
        const gameDate = game.date;
        return gameDate >= exportStartDate && gameDate <= exportEndDate;
      }
      return true;
    });

    if (gamesToExport.length === 0) {
      setExportDialogOpen(false);
      return;
    }

    // Generate combined ICS file
    const events = gamesToExport.map((game) => {
      const gameDateTime = parseGameDateTime(game.time, game.date);
      if (!gameDateTime) return null;
      
      const endDateTime = new Date(gameDateTime.getTime() + 3 * 60 * 60 * 1000);
      const homeTeam = teamMap.get(game.homeTeamId);
      const awayTeam = teamMap.get(game.awayTeamId);
      const homeTeamName = homeTeam?.name || game.homeTeamName || "Home Team";
      const awayTeamName = awayTeam?.name || game.awayTeamName || "Away Team";
      const title = `${awayTeamName} @ ${homeTeamName}`;
      const description = game.broadcast ? `Watch on: ${game.broadcast}` : "";
      
      return [
        "BEGIN:VEVENT",
        `UID:${game.id}@fancal.app`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(gameDateTime)}`,
        `DTEND:${formatICSDate(endDateTime)}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${game.venue || ""}`,
        "STATUS:CONFIRMED",
        "END:VEVENT",
      ].join("\r\n");
    }).filter(Boolean);

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//FanCal//Sports Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      ...events,
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    const filterLabel = teamFilter === "all" ? "all-teams" : (savedTeamsList.find(t => t.id === teamFilter)?.name || "team").replace(/\s+/g, "-");
    link.download = `fancal-${filterLabel}-schedule.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    setExportDialogOpen(false);
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
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-semibold" data-testid="text-calendar-title">
              My Calendar
            </h1>
            <button
              onClick={() => setExportDialogOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-2 bg-red-600 text-white rounded-md font-medium text-xs hover-elevate active-elevate-2"
              data-testid="button-add-to-calendar"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Add to Calendar</span>
            </button>
          </div>
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

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle data-testid="dialog-export-title">Add to Calendar</DialogTitle>
            <DialogDescription>
              Export {teamFilter === "all" ? "all your teams'" : (savedTeamsList.find(t => t.id === teamFilter)?.name || "selected team's")} games to your calendar app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label className="text-base font-medium">Date Range</Label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="exportRange"
                    value="all"
                    checked={exportRangeType === "all"}
                    onChange={() => setExportRangeType("all")}
                    className="w-4 h-4"
                    data-testid="radio-all-dates"
                  />
                  <span>All upcoming games</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="exportRange"
                    value="range"
                    checked={exportRangeType === "range"}
                    onChange={() => setExportRangeType("range")}
                    className="w-4 h-4"
                    data-testid="radio-date-range"
                  />
                  <span>Select date range</span>
                </label>
              </div>
            </div>
            
            {exportRangeType === "range" && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    data-testid="input-start-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    data-testid="input-end-date"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)} data-testid="button-cancel-export">
              Cancel
            </Button>
            <Button onClick={handleExportToCalendar} data-testid="button-confirm-export">
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
