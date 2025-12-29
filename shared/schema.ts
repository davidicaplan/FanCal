import { z } from "zod";

// Export auth models for Replit Auth integration
export * from "./models/auth";

export const leagueIds = [
  "nba",
  "nfl", 
  "mlb",
  "nhl",
  "wnba",
  "mls",
  "ncaa-football",
  "ncaa-basketball",
  "ncaa-womens-basketball",
  "premier-league",
  "la-liga",
  "bundesliga",
  "serie-a",
  "ligue-1"
] as const;

export type LeagueId = typeof leagueIds[number];

export const leagueSchema = z.object({
  id: z.enum(leagueIds),
  name: z.string(),
  shortName: z.string(),
  teamCount: z.number(),
  color: z.string(),
});

export type League = z.infer<typeof leagueSchema>;

export const teamSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  abbreviation: z.string(),
  leagueId: z.enum(leagueIds),
  conference: z.string().optional(),
  division: z.string().optional(),
  espnTeamId: z.string().optional(),
});

export type Team = z.infer<typeof teamSchema>;

export const gameSchema = z.object({
  id: z.string(),
  homeTeamId: z.string(),
  awayTeamId: z.string(),
  homeTeamName: z.string().optional(),
  awayTeamName: z.string().optional(),
  leagueId: z.enum(leagueIds),
  date: z.string(),
  time: z.string(),
  venue: z.string().optional(),
  status: z.enum(["scheduled", "live", "final"]).default("scheduled"),
  homeScore: z.number().optional(),
  awayScore: z.number().optional(),
  broadcast: z.string().optional(),
});

export type Game = z.infer<typeof gameSchema>;

export const userSelectionSchema = z.object({
  selectedTeams: z.record(z.enum(leagueIds), z.array(z.string())),
  leagueVisibility: z.record(z.enum(leagueIds), z.boolean()),
});

export type UserSelection = z.infer<typeof userSelectionSchema>;

export const leagues: League[] = [
  { id: "nba", name: "NBA", shortName: "NBA", teamCount: 30, color: "#C9082A" },
  { id: "nfl", name: "NFL", shortName: "NFL", teamCount: 32, color: "#013369" },
  { id: "mlb", name: "MLB", shortName: "MLB", teamCount: 30, color: "#002D72" },
  { id: "nhl", name: "NHL", shortName: "NHL", teamCount: 32, color: "#000000" },
  { id: "wnba", name: "WNBA", shortName: "WNBA", teamCount: 12, color: "#FF6A00" },
  { id: "mls", name: "MLS", shortName: "MLS", teamCount: 29, color: "#DA291C" },
  { id: "ncaa-football", name: "NCAA Football", shortName: "NCAAF", teamCount: 130, color: "#0033A0" },
  { id: "ncaa-basketball", name: "NCAA Men's Basketball", shortName: "NCAAB", teamCount: 360, color: "#FF6600" },
  { id: "ncaa-womens-basketball", name: "NCAA Women's Basketball", shortName: "NCAAW", teamCount: 364, color: "#FF6600" },
  { id: "premier-league", name: "Premier League", shortName: "EPL", teamCount: 20, color: "#38003c" },
  { id: "la-liga", name: "La Liga", shortName: "LaLiga", teamCount: 20, color: "#EE8707" },
  { id: "bundesliga", name: "Bundesliga", shortName: "BL", teamCount: 18, color: "#D20515" },
  { id: "serie-a", name: "Serie A", shortName: "SA", teamCount: 20, color: "#024494" },
  { id: "ligue-1", name: "Ligue 1", shortName: "L1", teamCount: 18, color: "#091C3E" },
];

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

export interface User {
  id: string;
  username: string;
  password: string;
}
