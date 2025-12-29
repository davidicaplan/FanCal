import { Link, useLocation } from "wouter";
import { CalendarDays, List, Settings, Menu, X, Trophy, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTeamSelection } from "@/lib/team-selection-context";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [location] = useLocation();
  const { getTotalSelectedTeams } = useTeamSelection();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const totalTeams = getTotalSelectedTeams();

  const isOnTeamSelection = location === "/" || location.startsWith("/teams");

  const navItems = [
    { path: "/", label: "Teams", icon: Trophy },
    { path: "/calendar", label: "Calendar", icon: CalendarDays },
    { path: "/games", label: "Games", icon: List },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const getUserInitials = () => {
    if (!user) return "?";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = () => {
    if (!user) return "";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email || "User";
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isOnTeamSelection ? (
              <Link href="/calendar" className="flex items-center gap-1.5 px-2.5 py-2 bg-blue-600 text-white rounded-md font-medium text-xs hover-elevate active-elevate-2" data-testid="link-view-calendar">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>View Calendar</span>
              </Link>
            ) : (
              <Link href="/" className="flex items-center gap-1.5 px-2.5 py-2 bg-blue-600 text-white rounded-md font-medium text-xs hover-elevate active-elevate-2" data-testid="link-select-teams">
                <Trophy className="w-3.5 h-3.5" />
                <span>Select Teams</span>
              </Link>
            )}
            <Link href="/games" className="flex items-center gap-1.5 px-2.5 py-2 bg-emerald-600 text-white rounded-md font-medium text-xs hover-elevate active-elevate-2" data-testid="link-upcoming-games">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Upcoming Games</span>
            </Link>
          </div>

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
            {isLoading ? (
              <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.profileImageUrl || undefined} alt={getUserDisplayName()} />
                      <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium" data-testid="text-user-name">{getUserDisplayName()}</p>
                    {user?.email && (
                      <p className="text-xs text-muted-foreground" data-testid="text-user-email">{user.email}</p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="gap-2 text-destructive focus:text-destructive"
                    data-testid="button-logout"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleLogin}
                className="gap-2"
                data-testid="button-login"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}

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
            {!isAuthenticated && !isLoading && (
              <>
                <div className="border-t my-2" />
                <Button
                  variant="default"
                  className="w-full justify-start gap-2"
                  onClick={handleLogin}
                  data-testid="mobile-button-login"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
