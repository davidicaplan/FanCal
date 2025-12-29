import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { TeamLogo } from "@/components/team-logo";
import type { Team } from "@shared/schema";

interface TeamCardProps {
  team: Team;
  isSelected: boolean;
  onToggle: () => void;
  leagueColor: string;
}

export function TeamCard({ team, isSelected, onToggle, leagueColor }: TeamCardProps) {
  return (
    <Card
      className={`relative overflow-visible p-4 cursor-pointer transition-all duration-200 hover-elevate active-elevate-2 ${
        isSelected ? "ring-2 ring-offset-2" : ""
      }`}
      style={isSelected ? { borderColor: leagueColor, boxShadow: `0 0 0 2px ${leagueColor}30` } : {}}
      onClick={onToggle}
      data-testid={`card-team-${team.id}`}
    >
      <div className="flex items-center gap-3">
        <TeamLogo 
          team={team} 
          leagueId={team.leagueId} 
          size="md" 
          leagueColor={leagueColor} 
        />
        
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground truncate">
            {team.city}
          </p>
          <h4 className="font-medium truncate" data-testid={`text-team-name-${team.id}`}>
            {team.name}
          </h4>
        </div>

        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0"
          data-testid={`checkbox-team-${team.id}`}
        />
      </div>
    </Card>
  );
}
