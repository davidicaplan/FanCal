# Sports Calendar App v1.2

## Overview
A web-based sports calendar application that allows users to track their favorite teams across 8 major leagues: NBA, NFL, MLB, NHL, NCAA Football, NCAA Basketball, Premier League, and La Liga. Now with multi-user support via Replit Auth.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js
- **Database**: PostgreSQL (Neon-backed via Replit)
- **Authentication**: Replit Auth (OpenID Connect)
- **State Management**: TanStack React Query + localStorage (guest) / PostgreSQL (authenticated)
- **Routing**: wouter

## Project Structure
```
client/
  src/
    components/       # Reusable UI components
      header.tsx      # Main navigation header with auth
      league-card.tsx # League selection cards
      team-card.tsx   # Team selection cards
      game-card.tsx   # Game display cards
      empty-state.tsx # Empty state components
    hooks/
      use-local-storage.ts  # localStorage hook
      use-auth.ts           # Authentication hook
    lib/
      theme-provider.tsx    # Dark/light mode context
      team-selection-context.tsx  # Team selection state (syncs with backend)
      auth-utils.ts         # Auth utility functions
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
  services/
    espn-api.ts       # ESPN API integration
  replit_integrations/
    auth/             # Replit Auth integration
  db.ts               # Database connection
  routes.ts           # API endpoints
  storage.ts          # Storage interface
shared/
  schema.ts           # Shared types and schemas
  models/
    auth.ts           # User and session database models
```

## Key Features
1. **User Authentication**: Sign in with Google, GitHub, email via Replit Auth
2. **Multi-User Support**: Team selections saved per user in database
3. **Guest Mode**: Works without login using localStorage
4. **League Selection**: Grid of 8 leagues with team counts
5. **Team Selection**: Multi-select with search/filter, conference filtering
6. **Calendar View**: Monthly/weekly views with game indicators
7. **Games List**: Chronological list with date/league filters
8. **Team Filter**: View games for specific teams
9. **Settings**: Theme toggle, league visibility, team management
10. **Real-time Data**: ESPN API integration for live scores

## API Endpoints
- `GET /api/leagues` - Get all leagues
- `GET /api/teams/all` - Get all teams
- `GET /api/teams/:leagueId` - Get teams by league
- `GET /api/games` - Get games (supports query params: leagueId, teamId, startDate, endDate)
- `GET /api/games/:gameId` - Get single game
- `GET /api/login` - Start login flow
- `GET /api/logout` - Logout user
- `GET /api/auth/user` - Get current user (authenticated)
- `GET /api/user/selections` - Get user's team selections (authenticated)
- `POST /api/user/selections` - Save user's team selections (authenticated)

## Database Tables
- `users` - User accounts (managed by Replit Auth)
- `sessions` - Session storage (managed by Replit Auth)
- `user_selections` - Team selections per user

## Running the App
The app runs on port 5000 using `npm run dev`.

## Recent Changes
- v1.2: Added multi-user support with Replit Auth
  - Users can sign in with Google, GitHub, or email
  - Team selections saved to database per user
  - Guest mode continues to work with localStorage
  - User menu in header with profile info and sign out
- v1.1: ESPN API integration for real-time game data
  - All games show accurate dates, times, venues, and broadcast info
  - Live scores and final results from ESPN
  - 30-minute cache for optimal performance
  - Coverage: NBA, NFL, MLB, NHL, NCAA Football, NCAA Basketball, Premier League, La Liga
  - Fixed Premier League and La Liga team abbreviation matching
- v1.0: Initial implementation with all core features
