import { createContext, useContext, useCallback, useEffect, useState, useRef } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  isLoading: boolean;
  showLoginPrompt: boolean;
  setShowLoginPrompt: (show: boolean) => void;
}

const TeamSelectionContext = createContext<TeamSelectionContextType | undefined>(undefined);

const getDefaultSelectedTeams = (): Record<string, string[]> => ({});
const getDefaultLeagueVisibility = (): Record<string, boolean> => ({
  nba: true,
  nfl: true,
  mlb: true,
  nhl: true,
  "ncaa-football": true,
  "ncaa-basketball": true,
  "premier-league": true,
  "la-liga": true,
  "bundesliga": true,
  "serie-a": true,
  "ligue-1": true,
});

export function TeamSelectionProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const isAuthenticated = !!user;
  const prevAuthenticatedRef = useRef<boolean | null>(null);
  const hasLoadedServerDataRef = useRef(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const [localSelectedTeams, setLocalSelectedTeams] = useLocalStorage<Record<string, string[]>>(
    "sports-calendar-selected-teams",
    getDefaultSelectedTeams()
  );
  const [localLeagueVisibility, setLocalLeagueVisibility] = useLocalStorage<Record<string, boolean>>(
    "sports-calendar-league-visibility",
    getDefaultLeagueVisibility()
  );

  const [selectedTeams, setSelectedTeams] = useState<Record<string, string[]>>(() => 
    isAuthenticated ? getDefaultSelectedTeams() : { ...localSelectedTeams }
  );
  const [leagueVisibility, setLeagueVisibility] = useState<Record<string, boolean>>(() => 
    isAuthenticated ? getDefaultLeagueVisibility() : { ...localLeagueVisibility }
  );

  const { data: serverSelections, isLoading: selectionsLoading, isFetched } = useQuery<{
    selectedTeams: Record<string, string[]>;
    leagueVisibility: Record<string, boolean>;
  }>({
    queryKey: ["/api/user/selections"],
    enabled: isAuthenticated,
    staleTime: 1000 * 60, // 1 minute
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { selectedTeams: Record<string, string[]>; leagueVisibility: Record<string, boolean> }) => {
      await apiRequest("POST", "/api/user/selections", data);
    },
  });

  // Handle auth state changes
  useEffect(() => {
    // On logout: reset to defaults and clear server data flag
    if (prevAuthenticatedRef.current === true && !isAuthenticated && !authLoading) {
      hasLoadedServerDataRef.current = false;
      const newTeams = getDefaultSelectedTeams();
      const newVisibility = getDefaultLeagueVisibility();
      setSelectedTeams(newTeams);
      setLeagueVisibility(newVisibility);
    }
    
    // On login: wait for server data
    if (prevAuthenticatedRef.current === false && isAuthenticated) {
      hasLoadedServerDataRef.current = false;
    }
    
    prevAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, authLoading]);

  // Load server selections when authenticated
  useEffect(() => {
    if (isAuthenticated && isFetched && serverSelections && !hasLoadedServerDataRef.current) {
      hasLoadedServerDataRef.current = true;
      setSelectedTeams(serverSelections.selectedTeams || getDefaultSelectedTeams());
      setLeagueVisibility(serverSelections.leagueVisibility || getDefaultLeagueVisibility());
    }
  }, [isAuthenticated, serverSelections, isFetched]);

  // Load local storage for guests
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      setSelectedTeams({ ...localSelectedTeams });
      setLeagueVisibility({ ...localLeagueVisibility });
    }
  }, [authLoading]);

  const saveSelections = useCallback((newSelectedTeams: Record<string, string[]>, newLeagueVisibility: Record<string, boolean>) => {
    if (isAuthenticated && hasLoadedServerDataRef.current) {
      saveMutation.mutate({ selectedTeams: newSelectedTeams, leagueVisibility: newLeagueVisibility });
    } else if (!isAuthenticated) {
      setLocalSelectedTeams({ ...newSelectedTeams });
      setLocalLeagueVisibility({ ...newLeagueVisibility });
    }
  }, [isAuthenticated, saveMutation, setLocalSelectedTeams, setLocalLeagueVisibility]);

  const toggleTeam = useCallback((leagueId: LeagueId, teamId: string) => {
    // If not authenticated, show login prompt
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    
    setSelectedTeams((prev) => {
      const leagueTeams = prev[leagueId] || [];
      const isSelected = leagueTeams.includes(teamId);
      const newTeams = {
        ...prev,
        [leagueId]: isSelected
          ? leagueTeams.filter((id) => id !== teamId)
          : [...leagueTeams, teamId],
      };
      setLeagueVisibility((currentVisibility) => {
        saveSelections(newTeams, currentVisibility);
        return currentVisibility;
      });
      return newTeams;
    });
  }, [saveSelections, isAuthenticated]);

  const selectAllTeams = useCallback((leagueId: LeagueId, teamIds: string[]) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    
    setSelectedTeams((prev) => {
      const newTeams = { ...prev, [leagueId]: [...teamIds] };
      setLeagueVisibility((currentVisibility) => {
        saveSelections(newTeams, currentVisibility);
        return currentVisibility;
      });
      return newTeams;
    });
  }, [saveSelections, isAuthenticated]);

  const clearAllTeams = useCallback((leagueId: LeagueId) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    
    setSelectedTeams((prev) => {
      const newTeams = { ...prev, [leagueId]: [] };
      setLeagueVisibility((currentVisibility) => {
        saveSelections(newTeams, currentVisibility);
        return currentVisibility;
      });
      return newTeams;
    });
  }, [saveSelections, isAuthenticated]);

  const toggleLeagueVisibility = useCallback((leagueId: LeagueId) => {
    setLeagueVisibility((prev) => {
      const newVisibility = { ...prev, [leagueId]: !prev[leagueId] };
      setSelectedTeams((currentTeams) => {
        saveSelections(currentTeams, newVisibility);
        return currentTeams;
      });
      return newVisibility;
    });
  }, [saveSelections]);

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
    const newTeams = getDefaultSelectedTeams();
    const newVisibility = getDefaultLeagueVisibility();
    setSelectedTeams(newTeams);
    setLeagueVisibility(newVisibility);
    saveSelections(newTeams, newVisibility);
  }, [saveSelections]);

  const isLoading = authLoading || (isAuthenticated && selectionsLoading && !hasLoadedServerDataRef.current);

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
        isLoading,
        showLoginPrompt,
        setShowLoginPrompt,
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
