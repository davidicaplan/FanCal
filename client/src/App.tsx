import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { TeamSelectionProvider } from "@/lib/team-selection-context";
import { Header } from "@/components/header";
import { PWAInstallBanner } from "@/components/pwa-install-banner";
import Home from "@/pages/home";
import TeamSelection from "@/pages/team-selection";
import CalendarView from "@/pages/calendar-view";
import GamesList from "@/pages/games-list";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/teams/:leagueId" component={TeamSelection} />
      <Route path="/calendar" component={CalendarView} />
      <Route path="/games" component={GamesList} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TeamSelectionProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Header />
              <main>
                <Router />
              </main>
              <PWAInstallBanner />
            </div>
            <Toaster />
          </TooltipProvider>
        </TeamSelectionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
