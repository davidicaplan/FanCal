import { useState } from "react";
import footballIcon from "@assets/IMG_8879_1766992529055.jpeg";
import basketballIcon from "@assets/IMG_8880_1766992529055.jpeg";
import { getEspnTeamId } from "@/lib/espn-team-ids";
import { getSoccerEspnTeamId } from "@/lib/soccer-team-ids";

interface TeamLogoProps {
  team: {
    abbreviation: string;
    name?: string;
    city?: string;
    leagueId?: string;
  };
  leagueId: string;
  size?: "sm" | "md" | "lg";
  leagueColor?: string;
}

function getTeamLogoUrl(team: { abbreviation: string; city?: string }, leagueId: string): string {
  const abbr = team.abbreviation.toLowerCase();
  
  switch (leagueId) {
    case "nba":
      return `https://a.espncdn.com/i/teamlogos/nba/500/${abbr}.png`;
    case "nfl":
      return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr}.png`;
    case "mlb":
      return `https://a.espncdn.com/i/teamlogos/mlb/500/${abbr}.png`;
    case "nhl":
      return `https://a.espncdn.com/i/teamlogos/nhl/500/${abbr}.png`;
    case "wnba":
      return `https://a.espncdn.com/i/teamlogos/wnba/500/${abbr}.png`;
    case "mls":
      return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/${abbr}.png&h=80&w=80`;
    case "ncaa-football":
    case "ncaa-basketball":
    case "ncaa-womens-basketball": {
      const espnId = team.city ? getEspnTeamId(team.city) : null;
      if (espnId) {
        return `https://a.espncdn.com/i/teamlogos/ncaa/500/${espnId}.png`;
      }
      return "";
    }
    case "premier-league":
    case "la-liga":
    case "bundesliga":
    case "serie-a":
    case "ligue-1": {
      const espnId = getSoccerEspnTeamId(abbr);
      if (espnId) {
        return `https://a.espncdn.com/i/teamlogos/soccer/500/${espnId}.png`;
      }
      return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/${abbr}.png&h=80&w=80`;
    }
    default:
      return "";
  }
}

function getFallbackIcon(leagueId: string): string | null {
  if (leagueId === "ncaa-football") {
    return footballIcon;
  }
  if (leagueId === "ncaa-basketball" || leagueId === "ncaa-womens-basketball") {
    return basketballIcon;
  }
  return null;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

export function TeamLogo({ team, leagueId, size = "md", leagueColor }: TeamLogoProps) {
  const [imageError, setImageError] = useState(false);
  const logoUrl = getTeamLogoUrl(team, leagueId);
  const fallbackIcon = getFallbackIcon(leagueId);
  const sizeClass = sizeClasses[size];
  
  if (imageError || !logoUrl) {
    if (fallbackIcon) {
      return (
        <div className={`${sizeClass} flex items-center justify-center rounded-md overflow-hidden`}>
          <img
            src={fallbackIcon}
            alt={team.name || team.abbreviation}
            className="w-full h-full object-contain"
          />
        </div>
      );
    }
    
    return (
      <div
        className={`${sizeClass} flex items-center justify-center rounded-md text-lg font-bold`}
        style={{ backgroundColor: leagueColor ? `${leagueColor}15` : undefined, color: leagueColor }}
      >
        {team.abbreviation.slice(0, 2)}
      </div>
    );
  }
  
  return (
    <div className={`${sizeClass} flex items-center justify-center`}>
      <img
        src={logoUrl}
        alt={team.name || team.abbreviation}
        className="w-full h-full object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
