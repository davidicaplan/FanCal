import { Link, useLocation } from "wouter";
import { CalendarDays, List, Settings, Menu, X, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/lib/theme-provider";
import { useTeamSelection } from "@/lib/team-selection-context";
import { useState } from "react";
import { Moon, Sun } from "lucide-react";

export function Header() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { getTotalSelectedTeams } = useTeamSelection();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const totalTeams = getTotalSelectedTeams();

  const navItems = [
    { path: "/", label: "Leagues", icon: Trophy },
    { path: "/calendar", label: "Calendar", icon: CalendarDays },
    { path: "/games", label: "Games", icon: List },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground">
              <CalendarDays className="w-5 h-5" />
            </div>
            <span className="font-semibold text-lg hidden sm:inline" data-testid="text-app-name">
              Sports Calendar
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className="gap-2"
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.path === "/" && totalTeams > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {totalTeams}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t flex flex-col gap-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.path === "/" && totalTeams > 0 && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {totalTeams}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
