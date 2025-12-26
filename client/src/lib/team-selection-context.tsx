import { createContext, useContext, useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { LeagueId } from "@shared/schema";

interface TeamSelectionContextType {
  selectedTeams: Record<string, string[]>;
  leagueVisibility: Record<string, boolean>;
  toggleTeam: (leagueId: LeagueId, teamId: string) => void;
  selectAllTeams: (leagueId: LeagueId, teamIds: string[]) => void;
  clearAllTeams: (leagueId: LeagueId) => void;
  toggleLeagueVisibility: (leagueId: LeagueId) => void;
  isTeamSelected: (leagueId: LeagueId, teamId: string) => boolean;
  getSelectedTeamCount: (leagueId: LeagueId) => number;
  getTotalSelectedTeams: () => number;
  clearAllSelections: () => void;
}

const TeamSelectionContext = createContext<TeamSelectionContextType | undefined>(undefined);

const defaultSelectedTeams: Record<string, string[]> = {};
const defaultLeagueVisibility: Record<string, boolean> = {
  nba: true,
  nfl: true,
  mlb: true,
  nhl: true,
  "ncaa-football": true,
  "ncaa-basketball": true,
  "premier-league": true,
  "la-liga": true,
};

export function TeamSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedTeams, setSelectedTeams] = useLocalStorage<Record<string, string[]>>(
    "sports-calendar-selected-teams",
    defaultSelectedTeams
  );
  const [leagueVisibility, setLeagueVisibility] = useLocalStorage<Record<string, boolean>>(
    "sports-calendar-league-visibility",
    defaultLeagueVisibility
  );

  const toggleTeam = useCallback((leagueId: LeagueId, teamId: string) => {
    setSelectedTeams((prev) => {
      const leagueTeams = prev[leagueId] || [];
      const isSelected = leagueTeams.includes(teamId);
      return {
        ...prev,
        [leagueId]: isSelected
          ? leagueTeams.filter((id) => id !== teamId)
          : [...leagueTeams, teamId],
      };
    });
  }, [setSelectedTeams]);

  const selectAllTeams = useCallback((leagueId: LeagueId, teamIds: string[]) => {
    setSelectedTeams((prev) => ({
      ...prev,
      [leagueId]: teamIds,
    }));
  }, [setSelectedTeams]);

  const clearAllTeams = useCallback((leagueId: LeagueId) => {
    setSelectedTeams((prev) => ({
      ...prev,
      [leagueId]: [],
    }));
  }, [setSelectedTeams]);

  const toggleLeagueVisibility = useCallback((leagueId: LeagueId) => {
    setLeagueVisibility((prev) => ({
      ...prev,
      [leagueId]: !prev[leagueId],
    }));
  }, [setLeagueVisibility]);

  const isTeamSelected = useCallback((leagueId: LeagueId, teamId: string) => {
    return (selectedTeams[leagueId] || []).includes(teamId);
  }, [selectedTeams]);

  const getSelectedTeamCount = useCallback((leagueId: LeagueId) => {
    return (selectedTeams[leagueId] || []).length;
  }, [selectedTeams]);

  const getTotalSelectedTeams = useCallback(() => {
    return Object.values(selectedTeams).reduce((total, teams) => total + teams.length, 0);
  }, [selectedTeams]);

  const clearAllSelections = useCallback(() => {
    setSelectedTeams(defaultSelectedTeams);
    setLeagueVisibility(defaultLeagueVisibility);
  }, [setSelectedTeams, setLeagueVisibility]);

  return (
    <TeamSelectionContext.Provider
      value={{
        selectedTeams,
        leagueVisibility,
        toggleTeam,
        selectAllTeams,
        clearAllTeams,
        toggleLeagueVisibility,
        isTeamSelected,
        getSelectedTeamCount,
        getTotalSelectedTeams,
        clearAllSelections,
      }}
    >
      {children}
    </TeamSelectionContext.Provider>
  );
}

export function useTeamSelection() {
  const context = useContext(TeamSelectionContext);
  if (!context) {
    throw new Error("useTeamSelection must be used within a TeamSelectionProvider");
  }
  return context;
}
