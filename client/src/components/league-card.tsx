import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import type { League } from "@shared/schema";
import { useTeamSelection } from "@/lib/team-selection-context";

interface LeagueCardProps {
  league: League;
  onClick: () => void;
}

const leagueIcons: Record<string, string> = {
  nba: "🏀",
  nfl: "🏈",
  mlb: "⚾",
  nhl: "🏒",
  "ncaa-football": "🏈",
  "ncaa-basketball": "🏀",
  "premier-league": "⚽",
  "la-liga": "⚽",
};

export function LeagueCard({ league, onClick }: LeagueCardProps) {
  const { getSelectedTeamCount } = useTeamSelection();
  const selectedCount = getSelectedTeamCount(league.id);
  const hasSelections = selectedCount > 0;

  return (
    <Card
      className={`relative overflow-visible p-6 cursor-pointer transition-all duration-200 hover-elevate active-elevate-2 ${
        hasSelections ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
      onClick={onClick}
      data-testid={`card-league-${league.id}`}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center w-16 h-16 rounded-md text-3xl"
          style={{ backgroundColor: `${league.color}15` }}
        >
          <span className="select-none" aria-hidden="true" style={{ color: league.color, fontFamily: 'system-ui' }}>
            {league.shortName.charAt(0)}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate" data-testid={`text-league-name-${league.id}`}>
            {league.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {league.teamCount} teams
          </p>
          {hasSelections && (
            <Badge 
              variant="secondary" 
              className="mt-2"
              style={{ backgroundColor: `${league.color}20`, color: league.color }}
            >
              {selectedCount} selected
            </Badge>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </div>
    </Card>
  );
}
