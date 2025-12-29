# Sports Calendar App v1.3

## Overview
A web-based sports calendar application that allows users to track their favorite teams across 11 major leagues: NBA, NFL, MLB, NHL, NCAA Football (all FBS programs), NCAA Basketball (major Division I conferences), Premier League, La Liga, Bundesliga, Serie A, and Ligue 1. Features multi-user support via Replit Auth.

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
    teams.ts          # Team data for all leagues (organized by conference/division)
  services/
    espn-api.ts       # ESPN API integration for all 11 leagues
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

## Leagues and Teams

### Professional Leagues
- **NBA**: 30 teams (Eastern/Western Conference, 6 divisions)
- **NFL**: 32 teams (AFC/NFC, 8 divisions)
- **MLB**: 30 teams (American/National League, 6 divisions)
- **NHL**: 32 teams (Eastern/Western Conference, 4 divisions)

### European Soccer
- **Premier League**: 20 teams
- **La Liga**: 20 teams
- **Bundesliga**: 18 teams
- **Serie A**: 20 teams
- **Ligue 1**: 18 teams

### NCAA Football (FBS - 130 teams)
Power Four Conferences:
- ACC (17 teams)
- Big Ten (18 teams)
- Big 12 (16 teams)
- SEC (16 teams)

Group of Five Conferences:
- AAC (14 teams)
- Conference USA (8 teams)
- MAC (12 teams)
- Mountain West (12 teams)
- Sun Belt (14 teams)
- Independents (3 teams)

### NCAA Basketball (Division I - 360 teams)
All 32 Division I Conferences:
- Power Conferences: ACC, Big East, Big Ten, Big 12, SEC
- Mid-Major Conferences: AAC, WCC, Mountain West, Atlantic 10, Pac-12, Missouri Valley, Conference USA
- Other Conferences: America East, ASUN, Big Sky, Big South, Big West, CAA, Horizon League, Ivy League, MAAC, MAC, MEAC, NEC, Ohio Valley, Patriot League, Southern Conference, Southland, SWAC, Summit League, Sun Belt, WAC

## Key Features
1. **User Authentication**: Sign in with Google, GitHub, email via Replit Auth
2. **Multi-User Support**: Team selections saved per user in database
3. **Guest Mode**: Works without login using localStorage
4. **League Selection**: Grid of 11 leagues with team counts
5. **Team Selection**: Multi-select with search/filter, conference filtering
6. **Calendar View**: Monthly/weekly views with game indicators
7. **Games List**: Chronological list with date/league filters
8. **Team Filter**: View games for specific teams
9. **Settings**: Theme toggle, league visibility, team management
10. **Real-time Data**: ESPN API integration for live scores
11. **Conference Organization**: Teams organized by conference and division

## API Endpoints
- `GET /api/leagues` - Get all leagues
- `GET /api/teams/all` - Get all teams (sorted alphabetically)
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

## PWA Features
The app is a Progressive Web App (PWA) that can be installed on mobile devices:
- **Offline Support**: Service worker caches static assets and API responses
- **Add to Home Screen**: Users can install the app to their device's home screen
- **App Icons**: Full set of icons for iOS and Android devices
- **Standalone Mode**: Runs in fullscreen without browser chrome when installed

## Recent Changes
- v1.3: Expanded to 11 leagues with comprehensive team coverage
  - Added Bundesliga (18 teams), Serie A (20 teams), Ligue 1 (18 teams)
  - NCAA Football expanded to all 130 FBS programs
  - NCAA Basketball includes 129 major Division I teams
  - Teams organized alphabetically and by conference/division
  - ESPN API integration for all new leagues
- v1.2: Added multi-user support with Replit Auth
  - Users can sign in with Google, GitHub, or email
  - Team selections saved to database per user
  - Guest mode continues to work with localStorage
  - User menu in header with profile info and sign out
- v1.1: ESPN API integration for real-time game data
  - All games show accurate dates, times, venues, and broadcast info
  - Live scores and final results from ESPN
  - 30-minute cache for optimal performance
- v1.0: Initial implementation with all core features
