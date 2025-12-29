import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import type { League } from "@shared/schema";
import { useTeamSelection } from "@/lib/team-selection-context";
import ncaaLogo from "@assets/IMG_8882_1766993283509.png";

interface LeagueCardProps {
  league: League;
  onClick: () => void;
}

const leagueLogos: Record<string, string> = {
  nba: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png",
  nfl: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png",
  mlb: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/mlb.png",
  nhl: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nhl.png",
  wnba: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/wnba.png",
  mls: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/mls.png",
  "ncaa-football": ncaaLogo,
  "ncaa-basketball": ncaaLogo,
  "ncaa-womens-basketball": ncaaLogo,
  "premier-league": "https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/23.png",
  "la-liga": "https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/15.png",
  "bundesliga": "https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/10.png",
  "serie-a": "https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/12.png",
  "ligue-1": "https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/9.png",
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
          className="flex items-center justify-center w-16 h-16 rounded-md overflow-hidden"
          style={{ backgroundColor: `${league.color}15` }}
        >
          {leagueLogos[league.id] ? (
            <img
              src={leagueLogos[league.id]}
              alt={league.name}
              className="w-12 h-12 object-contain"
            />
          ) : (
            <span className="select-none text-3xl" aria-hidden="true" style={{ color: league.color, fontFamily: 'system-ui' }}>
              {league.shortName.charAt(0)}
            </span>
          )}
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
