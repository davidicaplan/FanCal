import { useLocation } from "wouter";
import { LeagueCard } from "@/components/league-card";
import { leagues } from "@shared/schema";
import { useTeamSelection } from "@/lib/team-selection-context";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [, navigate] = useLocation();
  const { getTotalSelectedTeams } = useTeamSelection();
  const totalSelected = getTotalSelectedTeams();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">
            Select Teams
          </h1>
          {totalSelected > 0 && (
            <Badge variant="secondary" className="text-sm" data-testid="badge-total-teams">
              {totalSelected} team{totalSelected !== 1 ? "s" : ""} selected
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Choose a league to start following your favorite teams
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {leagues.map((league) => (
          <LeagueCard
            key={league.id}
            league={league}
            onClick={() => navigate(`/teams/${league.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
