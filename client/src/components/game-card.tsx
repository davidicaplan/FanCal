import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { TeamLogo } from "@/components/team-logo";
import type { Game, Team, League } from "@shared/schema";
import { format, parseISO } from "date-fns";

interface GameCardProps {
  game: Game;
  homeTeam?: Team;
  awayTeam?: Team;
  league: League;
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
  const isToday = format(new Date(), "yyyy-MM-dd") === game.date;
  const isTomorrow = format(new Date(Date.now() + 86400000), "yyyy-MM-dd") === game.date;

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
            <span className="font-mono" data-testid={`text-time-${game.id}`}>{game.time}</span>
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

        {(game.venue || game.broadcast) && (
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
          </div>
        )}
      </div>
    </Card>
  );
}
