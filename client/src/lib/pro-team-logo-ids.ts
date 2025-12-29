export const nbaLogoIds: Record<string, string> = {
  'gsw': 'gs',      // Golden State Warriors
  'nop': 'no',      // New Orleans Pelicans
  'uta': 'utah',    // Utah Jazz
  'ind': 'ind',     // Indiana Pacers (correct as-is)
};

export const nhlLogoIds: Record<string, string> = {
  'sjs': 'sj',      // San Jose Sharks
  'tbl': 'tb',      // Tampa Bay Lightning
};

export function getNbaLogoId(abbreviation: string): string {
  const abbr = abbreviation.toLowerCase();
  return nbaLogoIds[abbr] || abbr;
}

export function getNhlLogoId(abbreviation: string): string {
  const abbr = abbreviation.toLowerCase();
  return nhlLogoIds[abbr] || abbr;
}
