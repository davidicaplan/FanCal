import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import type { Game, Team, League } from "@shared/schema";
import { format, parseISO } from "date-fns";

interface GameCardProps {
  game: Game;
  homeTeam: Team;
  awayTeam: Team;
  league: League;
}

export function GameCard({ game, homeTeam, awayTeam, league }: GameCardProps) {
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
          <div className="flex-1 text-right">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-md text-lg font-bold mb-2"
              style={{ backgroundColor: `${league.color}15`, color: league.color }}
            >
              {awayTeam.abbreviation.slice(0, 2)}
            </div>
            <p className="font-medium truncate" data-testid={`text-away-team-${game.id}`}>{awayTeam.name}</p>
            <p className="text-sm text-muted-foreground">{awayTeam.city}</p>
          </div>

          <div className="flex flex-col items-center px-4">
            {game.status === "final" && game.awayScore !== undefined && game.homeScore !== undefined ? (
              <div className="flex items-center gap-2 font-mono text-xl font-bold">
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

          <div className="flex-1 text-left">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-md text-lg font-bold mb-2"
              style={{ backgroundColor: `${league.color}15`, color: league.color }}
            >
              {homeTeam.abbreviation.slice(0, 2)}
            </div>
            <p className="font-medium truncate" data-testid={`text-home-team-${game.id}`}>{homeTeam.name}</p>
            <p className="text-sm text-muted-foreground">{homeTeam.city}</p>
          </div>
        </div>

        {game.venue && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground justify-center pt-2 border-t">
            <MapPin className="w-3 h-3" />
            <span data-testid={`text-venue-${game.id}`}>{game.venue}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
