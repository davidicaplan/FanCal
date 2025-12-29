export const soccerEspnIds: Record<string, string> = {
  // Premier League (ESPN uses numeric IDs for soccer)
  'ars': '359',      // Arsenal
  'avl': '362',      // Aston Villa
  'bou': '349',      // Bournemouth
  'bre': '337',      // Brentford
  'bha': '331',      // Brighton
  'che': '363',      // Chelsea
  'cry': '384',      // Crystal Palace
  'eve': '368',      // Everton
  'ful': '370',      // Fulham
  'ips': '373',      // Ipswich
  'lei': '375',      // Leicester
  'liv': '364',      // Liverpool
  'mnc': '382',      // Manchester City
  'man': '360',      // Manchester United
  'new': '361',      // Newcastle
  'nfo': '393',      // Nottingham Forest
  'sou': '376',      // Southampton
  'tot': '367',      // Tottenham
  'whu': '371',      // West Ham
  'wol': '380',      // Wolverhampton
  'leg': '391',      // Leeds (Leeds was in PL)
  
  // La Liga
  'bar': '83',       // Barcelona
  'rma': '86',       // Real Madrid
  'atm': '1068',     // Atletico Madrid
  'vil': '102',      // Villarreal
  'esp': '88',       // Espanyol
  'bet': '244',      // Real Betis
  'cel': '85',       // Celta Vigo
  'ath': '93',       // Athletic Bilbao
  'sev': '243',      // Sevilla
  'get': '9812',     // Getafe
  'osa': '84',       // Osasuna
  'mll': '96',       // Mallorca
  'ala': '1564',     // Deportivo Alaves
  'ray': '87',       // Rayo Vallecano
  'rso': '89',       // Real Sociedad
  'val': '94',       // Valencia
  'gir': '9811',     // Girona
  'lev': '97',       // Levante
  'vll': '95',       // Real Valladolid
  'lpa': '101',      // Las Palmas

  // Bundesliga
  'bay': '132',      // Bayern Munich
  'bvb': '124',      // Borussia Dortmund
  'b04': '131',      // Bayer Leverkusen
  'rbl': '11420',    // RB Leipzig
  'tsg': '3205',     // Hoffenheim
  'vfb': '134',      // VfB Stuttgart
  'sge': '125',      // Eintracht Frankfurt
  'fcu': '10999',    // Union Berlin
  'scf': '129',      // SC Freiburg
  'svw': '133',      // Werder Bremen
  'bmg': '123',      // Borussia Monchengladbach
  'wob': '135',      // Wolfsburg
  'aug': '10204',    // FC Augsburg
  'stp': '10801',    // St. Pauli
  'hdh': '12491',    // Heidenheim
  'm05': '127',      // Mainz 05
  'boc': '221',      // VfL Bochum
  'kie': '10374',    // Holstein Kiel
  
  // Serie A
  'int': '110',      // Inter Milan
  'acm': '103',      // AC Milan
  'nap': '114',      // Napoli
  'juv': '111',      // Juventus
  'rom': '104',      // AS Roma
  'com': '119',      // Como
  'bol': '107',      // Bologna
  'laz': '105',      // Lazio
  'ata': '3454',     // Atalanta
  'udi': '115',      // Udinese
  'tor': '117',      // Torino
  'cag': '113',      // Cagliari
  'par': '106',      // Parma
  'lec': '398',      // Lecce
  'gen': '112',      // Genoa
  'hel': '276',      // Hellas Verona
  'fio': '109',      // Fiorentina
  'emp': '230',      // Empoli
  'mon': '3472',     // Monza
  'ven': '120',      // Venezia
  
  // Ligue 1
  'len': '3779',     // RC Lens
  'psg': '160',      // Paris Saint-Germain
  'mar': '158',      // Olympique Marseille
  'lil': '166',      // Lille
  'lyo': '163',      // Lyon
  'ren': '164',      // Rennes
  'str': '3780',     // Strasbourg
  'tou': '180',      // Toulouse
  'ang': '169',      // Angers
  'nic': '162',      // Nice
  'hav': '3778',     // Le Havre
  'aux': '167',      // Auxerre
  'nan': '165',      // Nantes
  'rei': '3784',     // Reims
  'mtp': '176',      // Montpellier
  'ste': '186',      // Saint-Etienne
};

export function getSoccerEspnTeamId(abbreviation: string): string | null {
  const abbr = abbreviation.toLowerCase();
  return soccerEspnIds[abbr] || null;
}
