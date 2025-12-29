export const mlsEspnIds: Record<string, string> = {
  'atl': '18418',    // Atlanta United FC
  'atx': '20906',    // Austin FC
  'mtl': '9720',     // CF Montréal
  'clt': '21300',    // Charlotte FC
  'chi': '182',      // Chicago Fire FC
  'col': '184',      // Colorado Rapids
  'clb': '183',      // Columbus Crew
  'dc': '193',       // D.C. United
  'cin': '18267',    // FC Cincinnati
  'dal': '185',      // FC Dallas
  'hou': '6077',     // Houston Dynamo FC
  'mia': '20232',    // Inter Miami CF
  'lag': '187',      // LA Galaxy
  'lafc': '18966',   // LAFC
  'min': '17362',    // Minnesota United FC
  'nsh': '18986',    // Nashville SC
  'ne': '189',       // New England Revolution
  'nyc': '17606',    // New York City FC
  'nyrb': '190',     // New York Red Bulls
  'orl': '12011',    // Orlando City SC
  'phi': '10739',    // Philadelphia Union
  'por': '9723',     // Portland Timbers
  'rsl': '4771',     // Real Salt Lake
  'sd': '22529',     // San Diego FC
  'sj': '191',       // San Jose Earthquakes
  'sea': '9726',     // Seattle Sounders FC
  'skc': '186',      // Sporting Kansas City
  'stl': '21812',    // St. Louis CITY SC
  'tor': '7318',     // Toronto FC
  'van': '9727',     // Vancouver Whitecaps
};

export function getMlsEspnTeamId(abbreviation: string): string | null {
  const abbr = abbreviation.toLowerCase();
  return mlsEspnIds[abbr] || null;
}
