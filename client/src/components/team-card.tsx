import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
        <div
          className="flex items-center justify-center w-12 h-12 rounded-md text-xl font-bold"
          style={{ backgroundColor: `${leagueColor}15`, color: leagueColor }}
        >
          {team.abbreviation.slice(0, 2)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate" data-testid={`text-team-name-${team.id}`}>
            {team.name}
          </h4>
          <p className="text-sm text-muted-foreground truncate">
            {team.city}
          </p>
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
