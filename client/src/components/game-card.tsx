import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, CalendarPlus } from "lucide-react";
import { TeamLogo } from "@/components/team-logo";
import type { Game, Team, League } from "@shared/schema";
import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

interface GameCardProps {
  game: Game;
  homeTeam?: Team;
  awayTeam?: Team;
  league: League;
}

const PST_TIMEZONE = "America/Los_Angeles";
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
  
  // ESPN provides times in Eastern Time
  // Parse as Eastern Time and convert to UTC
  // For dates in Standard Time (Nov-Mar): ET = UTC-5
  // For dates in Daylight Time (Mar-Nov): ET = UTC-4
  
  // Parse the date to check if DST is in effect
  const [year, month, day] = date.split("-").map(Number);
  
  // Create a Date object to check DST status for Eastern Time
  // US DST: Second Sunday in March to First Sunday in November
  const isDST = (() => {
    // Approximate DST check for US Eastern Time
    if (month > 3 && month < 11) return true;
    if (month < 3 || month > 11) return false;
    if (month === 3) {
      // Second Sunday in March - DST starts
      const firstDay = new Date(year, 2, 1).getDay();
      const secondSunday = 8 + (7 - firstDay) % 7;
      return day >= secondSunday;
    }
    // First Sunday in November - DST ends
    const firstDay = new Date(year, 10, 1).getDay();
    const firstSunday = 1 + (7 - firstDay) % 7;
    return day < firstSunday;
  })();
  
  const etOffset = isDST ? -4 : -5; // EDT is UTC-4, EST is UTC-5
  
  // Create UTC time from Eastern Time
  const utcHours = hours - etOffset;
  const utcDate = new Date(Date.UTC(year, month - 1, day, utcHours, minutes, 0));
  
  return utcDate;
}

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function generateICS(game: Game, homeTeamFullName: string, awayTeamFullName: string, venue: string): string | null {
  const gameDateTime = parseGameDateTime(game.time, game.date);
  if (!gameDateTime) return null;
  
  const endDateTime = new Date(gameDateTime.getTime() + 3 * 60 * 60 * 1000); // 3 hours later
  
  const title = `${awayTeamFullName} @ ${homeTeamFullName}`;
  const description = game.broadcast ? `Watch on: ${game.broadcast}` : "";
  
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FanCal//Sports Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${game.id}@fancal.app`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(gameDateTime)}`,
    `DTEND:${formatICSDate(endDateTime)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${venue}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  
  return icsContent;
}

function downloadICS(game: Game, homeTeamFullName: string, awayTeamFullName: string, venue: string): boolean {
  const icsContent = generateICS(game, homeTeamFullName, awayTeamFullName, venue);
  if (!icsContent) return false;
  
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${awayTeamFullName.replace(/\s+/g, "-")}-at-${homeTeamFullName.replace(/\s+/g, "-")}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
  return true;
}

function convertTimeToPST(time: string, date: string): string {
  if (!isValidGameTime(time)) {
    return time; // Return original if TBD or invalid
  }
  
  try {
    const gameDateTime = parseGameDateTime(time, date);
    if (!gameDateTime) return time;
    
    // Format in PST
    return formatInTimeZone(gameDateTime, PST_TIMEZONE, "h:mm a") + " PST";
  } catch {
    // If parsing fails, return original time
    return time;
  }
}

export function GameCard({ game, homeTeam, awayTeam, league }: GameCardProps) {
  const homeTeamFullName = homeTeam?.name || game.homeTeamName || "Home Team";
  const awayTeamFullName = awayTeam?.name || game.awayTeamName || "Away Team";
  const homeTeamAbbr = homeTeam?.abbreviation || homeTeamFullName.slice(0, 4).toUpperCase();
  const awayTeamAbbr = awayTeam?.abbreviation || awayTeamFullName.slice(0, 4).toUpperCase();
  const homeTeamName = homeTeamFullName.length > 14 ? homeTeamAbbr : homeTeamFullName;
  const awayTeamName = awayTeamFullName.length > 14 ? awayTeamAbbr : awayTeamFullName;
  const homeTeamCity = homeTeam?.city || "";
  const awayTeamCity = awayTeam?.city || "";
  const gameDate = parseISO(game.date);
  const gamePSTTime = convertTimeToPST(game.time, game.date);
  const canExportToCalendar = game.status !== "final" && isValidGameTime(game.time);
  const isToday = format(new Date(), "yyyy-MM-dd") === game.date;
  const isTomorrow = format(new Date(Date.now() + 86400000), "yyyy-MM-dd") === game.date;
  const showFooter = game.venue || game.broadcast || canExportToCalendar;

  const getDateLabel = () => {
    if (isToday) return "Today";
    if (isTomorrow) return "Tomorrow";
    return format(gameDate, "EEE, MMM d");
  };

  return (
    <Card className="overflow-visible p-4 hover-elevate transition-all duration-200" data-testid={`card-game-${game.id}`}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Badge
            variant="secondary"
            style={{ backgroundColor: `${league.color}15`, color: league.color }}
            data-testid={`badge-league-${game.id}`}
          >
            {league.shortName}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono" data-testid={`text-date-${game.id}`}>{getDateLabel()}</span>
            <span className="text-muted-foreground/50">|</span>
            <Clock className="w-3 h-3" />
            <span className="font-mono" data-testid={`text-time-${game.id}`}>{gamePSTTime}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="flex-1 flex flex-col items-end min-w-0">
            <div className="mb-2">
              {awayTeam ? (
                <TeamLogo 
                  team={awayTeam} 
                  leagueId={league.id} 
                  size="md" 
                  leagueColor={league.color} 
                />
              ) : (
                <div
                  className="w-12 h-12 flex items-center justify-center rounded-md text-lg font-bold"
                  style={{ backgroundColor: `${league.color}15`, color: league.color }}
                >
                  {(game.awayTeamName || "Away").slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            {awayTeamCity && <p className="text-xs text-muted-foreground text-right truncate max-w-full">{awayTeamCity}</p>}
            <p className="text-sm font-medium truncate text-right max-w-full" data-testid={`text-away-team-${game.id}`}>{awayTeamName}</p>
          </div>

          <div className="flex flex-col items-center px-2 shrink-0">
            {game.status === "final" && game.awayScore !== undefined && game.homeScore !== undefined ? (
              <div className="flex items-center gap-1 font-mono text-lg font-bold">
                <span>{game.awayScore}</span>
                <span className="text-muted-foreground">-</span>
                <span>{game.homeScore}</span>
              </div>
            ) : (
              <span className="text-lg font-medium text-muted-foreground">@</span>
            )}
            {game.status === "live" && (
              <Badge variant="destructive" className="mt-1 animate-pulse">LIVE</Badge>
            )}
            {game.status === "final" && (
              <Badge variant="secondary" className="mt-1">Final</Badge>
            )}
          </div>

          <div className="flex-1 flex flex-col items-start min-w-0">
            <div className="mb-2">
              {homeTeam ? (
                <TeamLogo 
                  team={homeTeam} 
                  leagueId={league.id} 
                  size="md" 
                  leagueColor={league.color} 
                />
              ) : (
                <div
                  className="w-12 h-12 flex items-center justify-center rounded-md text-lg font-bold"
                  style={{ backgroundColor: `${league.color}15`, color: league.color }}
                >
                  {(game.homeTeamName || "Home").slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            {homeTeamCity && <p className="text-xs text-muted-foreground truncate max-w-full">{homeTeamCity}</p>}
            <p className="text-sm font-medium truncate max-w-full" data-testid={`text-home-team-${game.id}`}>{homeTeamName}</p>
          </div>
        </div>

        {showFooter && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground justify-center pt-2 border-t flex-wrap">
            {game.venue && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span data-testid={`text-venue-${game.id}`}>{game.venue}</span>
              </div>
            )}
            {game.broadcast && (
              <Badge variant="outline" className="text-xs">
                {game.broadcast}
              </Badge>
            )}
            {canExportToCalendar && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs h-7"
                onClick={() => downloadICS(game, homeTeamFullName, awayTeamFullName, game.venue || "")}
                data-testid={`button-add-calendar-${game.id}`}
              >
                <CalendarPlus className="w-3 h-3" />
                Add to Calendar
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
