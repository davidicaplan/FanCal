import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CalendarX, Trophy, ListX } from "lucide-react";

interface EmptyStateProps {
  type: "no-teams" | "no-games" | "no-results";
  title?: string;
  description?: string;
}

export function EmptyState({ type, title, description }: EmptyStateProps) {
  const defaults = {
    "no-teams": {
      icon: Trophy,
      title: "No teams selected",
      description: "Select your favorite teams to start tracking their games",
      cta: { label: "Select Teams", href: "/" },
    },
    "no-games": {
      icon: CalendarX,
      title: "No games scheduled",
      description: "There are no games for your selected teams in this time period",
      cta: null,
    },
    "no-results": {
      icon: ListX,
      title: "No results found",
      description: "Try adjusting your search or filter criteria",
      cta: null,
    },
  };

  const config = defaults[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center" data-testid={`empty-state-${type}`}>
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title || config.title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        {description || config.description}
      </p>
      {config.cta && (
        <Link href={config.cta.href}>
          <Button data-testid="button-select-teams">{config.cta.label}</Button>
        </Link>
      )}
    </div>
  );
}
