import { useLocation } from "wouter";
import { LeagueCard } from "@/components/league-card";
import { leagues } from "@shared/schema";
import { useTeamSelection } from "@/lib/team-selection-context";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const { getTotalSelectedTeams } = useTeamSelection();
  const totalSelected = getTotalSelectedTeams();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">
            Select Your Leagues
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

      {totalSelected > 0 && (
        <div className="mt-12 p-6 bg-card rounded-lg border">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold">Ready to view your calendar?</h2>
              <p className="text-sm text-muted-foreground">
                You have {totalSelected} team{totalSelected !== 1 ? "s" : ""} selected across all leagues
              </p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => navigate("/calendar")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover-elevate active-elevate-2"
              data-testid="button-view-calendar"
            >
              <CalendarDays className="w-4 h-4" />
              View Calendar
            </button>
            <button
              onClick={() => navigate("/games")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-medium hover-elevate active-elevate-2"
              data-testid="button-view-games"
            >
              View Upcoming Games
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
