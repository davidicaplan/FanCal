import type { GameOdds } from "@shared/schema";

interface OddsDisplayProps {
  odds: GameOdds;
  homeTeamName: string;
  awayTeamName: string;
}

function formatOdds(price: number): string {
  return price > 0 ? `+${price}` : `${price}`;
}

function formatPoint(point: number): string {
  return point > 0 ? `+${point}` : `${point}`;
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function OddsDisplay({ odds, homeTeamName, awayTeamName }: OddsDisplayProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>via {odds.bookmaker}</span>
        <span>{timeAgo(odds.lastUpdate)}</span>
      </div>

      <div className="grid grid-cols-3 gap-1 text-xs text-center">
        {/* Header */}
        <div />
        <div className="font-medium truncate">{awayTeamName}</div>
        <div className="font-medium truncate">{homeTeamName}</div>

        {/* Moneyline */}
        {odds.moneyline && (
          <>
            <div className="text-muted-foreground text-left">ML</div>
            <div className="font-mono bg-muted/50 rounded px-1 py-0.5">
              {formatOdds(odds.moneyline.away)}
            </div>
            <div className="font-mono bg-muted/50 rounded px-1 py-0.5">
              {formatOdds(odds.moneyline.home)}
            </div>
          </>
        )}

        {/* Spread */}
        {odds.spread && (
          <>
            <div className="text-muted-foreground text-left">Spread</div>
            <div className="font-mono bg-muted/50 rounded px-1 py-0.5">
              {formatPoint(odds.spread.away)} ({formatOdds(odds.spread.awayPrice)})
            </div>
            <div className="font-mono bg-muted/50 rounded px-1 py-0.5">
              {formatPoint(odds.spread.home)} ({formatOdds(odds.spread.homePrice)})
            </div>
          </>
        )}

        {/* Over/Under */}
        {odds.total && (
          <>
            <div className="text-muted-foreground text-left">O/U</div>
            <div className="font-mono bg-muted/50 rounded px-1 py-0.5">
              O {odds.total.over} ({formatOdds(odds.total.overPrice)})
            </div>
            <div className="font-mono bg-muted/50 rounded px-1 py-0.5">
              U {odds.total.under} ({formatOdds(odds.total.underPrice)})
            </div>
          </>
        )}

        {/* Draw (soccer) */}
        {odds.moneyline?.draw !== undefined && (
          <>
            <div className="text-muted-foreground text-left">Draw</div>
            <div className="font-mono bg-muted/50 rounded px-1 py-0.5 col-span-2">
              {formatOdds(odds.moneyline.draw)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
