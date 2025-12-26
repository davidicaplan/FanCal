# Sports Calendar App v1.0

## Overview
A web-based sports calendar application that allows users to track their favorite teams across 8 major leagues: NBA, NFL, MLB, NHL, NCAA Football, NCAA Basketball, Premier League, and La Liga.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js
- **State Management**: TanStack React Query + localStorage
- **Routing**: wouter

## Project Structure
```
client/
  src/
    components/       # Reusable UI components
      header.tsx      # Main navigation header
      league-card.tsx # League selection cards
      team-card.tsx   # Team selection cards
      game-card.tsx   # Game display cards
      empty-state.tsx # Empty state components
    hooks/
      use-local-storage.ts  # localStorage hook
    lib/
      theme-provider.tsx    # Dark/light mode context
      team-selection-context.tsx  # Team selection state
    pages/
      home.tsx              # League selection grid
      team-selection.tsx    # Team selection per league
      calendar-view.tsx     # Calendar view with games
      games-list.tsx        # Chronological games list
      settings.tsx          # App settings
server/
  data/
    teams.ts          # Team data for all leagues
    games.ts          # Generated game schedule
  routes.ts           # API endpoints
  storage.ts          # Storage interface
shared/
  schema.ts           # Shared types and schemas
```

## Key Features
1. **League Selection**: Grid of 8 leagues with team counts
2. **Team Selection**: Multi-select with search/filter, conference filtering
3. **Calendar View**: Monthly/weekly views with game indicators
4. **Games List**: Chronological list with date/league filters
5. **Settings**: Theme toggle, league visibility, team management
6. **Persistence**: All selections saved to localStorage

## API Endpoints
- `GET /api/leagues` - Get all leagues
- `GET /api/teams/all` - Get all teams
- `GET /api/teams/:leagueId` - Get teams by league
- `GET /api/games` - Get games (supports query params: leagueId, teamId, startDate, endDate)
- `GET /api/games/:gameId` - Get single game

## Running the App
The app runs on port 5000 using `npm run dev`.

## Recent Changes
- Initial v1.0 implementation with all core features
- League selection with team counts
- Team selection with search and conference filters
- Calendar view with month/week toggle
- Games list with date and league filters
- Settings with dark mode and visibility controls
- localStorage persistence for selections
- Integrated ESPN public API for real-time game schedules (v1.1)
  - All games now show accurate dates, times, venues, and broadcast info
  - Live scores and final results from ESPN
  - 5-minute cache for optimal performance
  - Coverage: NBA, NFL, MLB, NHL, NCAA Football, NCAA Basketball, Premier League, La Liga
