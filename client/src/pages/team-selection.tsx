import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { TeamCard } from "@/components/team-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamSelection } from "@/lib/team-selection-context";
import { leagues, type Team } from "@shared/schema";
import { ArrowLeft, Search, CheckSquare, XSquare, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TeamSelection() {
  const params = useParams<{ leagueId: string }>();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [conferenceFilter, setConferenceFilter] = useState<string>("all");

  const league = leagues.find((l) => l.id === params.leagueId);
  const { toggleTeam, selectAllTeams, clearAllTeams, isTeamSelected, getSelectedTeamCount } =
    useTeamSelection();

  const { data: teams = [], isLoading } = useQuery<Team[]>({
    queryKey: [`/api/teams/${params.leagueId}`],
    enabled: !!params.leagueId,
  });

  const conferences = useMemo(() => {
    const conferenceSet = new Set<string>();
    teams.forEach((team) => {
      if (team.conference) conferenceSet.add(team.conference);
    });
    return Array.from(conferenceSet).sort();
  }, [teams]);

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch =
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.abbreviation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesConference =
        conferenceFilter === "all" || team.conference === conferenceFilter;
      return matchesSearch && matchesConference;
    });
  }, [teams, searchQuery, conferenceFilter]);

  const selectedCount = league ? getSelectedTeamCount(league.id) : 0;

  if (!league) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">League not found</h2>
          <Link href="/">
            <Button variant="secondary">Back to Leagues</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSelectAll = () => {
    selectAllTeams(
      league.id,
      filteredTeams.map((t) => t.id)
    );
  };

  const handleClearAll = () => {
    clearAllTeams(league.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur -mx-4 md:-mx-8 px-4 md:px-8 pb-4 pt-2 border-b mb-6">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold" data-testid="text-league-title">
                {league.name}
              </h1>
              <Badge
                style={{ backgroundColor: `${league.color}15`, color: league.color }}
                data-testid="badge-selected-count"
              >
                {selectedCount} / {teams.length} selected
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Select the teams you want to follow
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-teams"
            />
          </div>

          {conferences.length > 0 && (
            <Select value={conferenceFilter} onValueChange={setConferenceFilter}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-conference">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Conferences" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conferences</SelectItem>
                {conferences.map((conf) => (
                  <SelectItem key={conf} value={conf}>
                    {conf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSelectAll}
              className="flex-1 sm:flex-initial"
              data-testid="button-select-all"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Select All
            </Button>
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="flex-1 sm:flex-initial"
              data-testid="button-clear-all"
            >
              <XSquare className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No teams match your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              isSelected={isTeamSelected(league.id, team.id)}
              onToggle={() => toggleTeam(league.id, team.id)}
              leagueColor={league.color}
            />
          ))}
        </div>
      )}
    </div>
  );
}
