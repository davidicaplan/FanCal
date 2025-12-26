import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTeamSelection } from "@/lib/team-selection-context";
import { useTheme } from "@/lib/theme-provider";
import { leagues } from "@shared/schema";
import { Settings as SettingsIcon, Trash2, ChevronRight, Moon, Sun, Eye, EyeOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const {
    leagueVisibility,
    toggleLeagueVisibility,
    getSelectedTeamCount,
    getTotalSelectedTeams,
    clearAllSelections,
  } = useTeamSelection();
  const { toast } = useToast();

  const totalSelected = getTotalSelectedTeams();

  const handleClearAll = () => {
    clearAllSelections();
    toast({
      title: "Selections cleared",
      description: "All team selections have been removed.",
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-8 h-8" />
          <h1 className="text-3xl font-semibold" data-testid="text-settings-title">
            Settings
          </h1>
        </div>
        <p className="text-muted-foreground">
          Manage your preferences and team selections
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "light" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              Appearance
            </CardTitle>
            <CardDescription>Customize how the app looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                data-testid="switch-dark-mode"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              League Visibility
            </CardTitle>
            <CardDescription>
              Control which leagues appear in your calendar and games list
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {leagues.map((league) => {
              const selectedCount = getSelectedTeamCount(league.id);
              const isVisible = leagueVisibility[league.id] !== false;
              return (
                <div key={league.id} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: `${league.color}15`, color: league.color }}
                    >
                      {league.shortName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{league.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedCount} team{selectedCount !== 1 ? "s" : ""} selected
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Switch
                      checked={isVisible}
                      onCheckedChange={() => toggleLeagueVisibility(league.id)}
                      data-testid={`switch-visibility-${league.id}`}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Teams</CardTitle>
            <CardDescription>
              {totalSelected > 0
                ? `You have ${totalSelected} team${totalSelected !== 1 ? "s" : ""} selected across all leagues`
                : "Select teams to start tracking their games"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {leagues.map((league) => {
              const selectedCount = getSelectedTeamCount(league.id);
              return (
                <Link key={league.id} href={`/teams/${league.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-md hover-elevate cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: `${league.color}15`, color: league.color }}
                      >
                        {league.shortName.charAt(0)}
                      </div>
                      <span className="font-medium">{league.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedCount > 0 && (
                        <Badge variant="secondary">{selectedCount}</Badge>
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions that will reset your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" data-testid="button-clear-all-data">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Selections
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all your team selections and reset visibility settings.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="button-cancel-clear">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAll}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-testid="button-confirm-clear"
                  >
                    Clear Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
