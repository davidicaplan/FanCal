# Sports Calendar App - Design Guidelines v1.0

## Design Approach
**Selected System**: Material Design with sports-centric adaptations
**Rationale**: Information-dense application requiring clear data hierarchy, robust interaction patterns, and scalable component library. Material's elevation system and card-based layouts excel at organizing complex sports data while maintaining visual clarity.

---

## Typography

**Primary Font**: Inter (via Google Fonts CDN)
**Secondary Font**: Roboto Mono (for game times, scores)

**Hierarchy**:
- Page Titles: 32px, semibold (League names, "My Calendar")
- Section Headers: 24px, semibold (Team selection, Game list headers)
- Card Titles: 18px, medium (Team names, game matchups)
- Body Text: 16px, regular (Descriptions, settings)
- Metadata: 14px, regular (Game times, dates, leagues)
- Small Labels: 12px, medium, uppercase (League badges, filters)

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section spacing: gap-6 to gap-8
- Page margins: px-4 md:px-8 lg:px-16
- Card spacing: p-6

**Container Widths**:
- Maximum content width: max-w-7xl
- Calendar container: max-w-6xl
- Centered layouts with mx-auto

---

## Component Library

### League Selection Grid
- 4-column grid (desktop), 2-column (tablet), 1-column (mobile)
- Clickable cards with league logo (80x80px), name, team count
- Elevated cards with subtle shadow, hover lift effect
- Current selection indicated with accent border

### Team Selection Interface
- Search bar at top (full-width, rounded-lg, p-4)
- Grid layout: 3-column (desktop), 2-column (tablet), 1-column (mobile)
- Team cards with checkbox, logo (60x60px), team name, city
- Selected state: filled checkbox, elevated card
- "Select All" / "Clear All" actions in header
- Sticky header with selected count badge

### Calendar Component
- Clean month/week view toggle in header
- Grid-based calendar cells
- Game indicators: small colored dots (league-coded) in date cells
- Click to expand: modal/drawer showing day's games
- Navigation: Previous/Next month arrows, "Today" quick action
- Mini calendar sidebar showing selected teams' upcoming games (5 games)

### Game List View
- Chronological card list with generous spacing (gap-4)
- Each game card contains:
  - League badge (top-left corner)
  - Team logos (50x50px each, side-by-side)
  - Team names (bold)
  - Date/Time (Roboto Mono)
  - Venue info (subtle, smaller text)
- Filter bar with chips: "Today", "This Week", "Next Week", league filters
- Infinite scroll or load more pattern

### Settings Panel
- Drawer/modal overlay from right side
- Sectioned layout with dividers
- Toggle switches for league visibility
- "Manage Teams" button per league (navigates to team selection)
- Clear storage option with confirmation dialog

### Navigation
- Top navigation bar: App logo/name, "Calendar", "Games", "Settings" links
- Mobile: Hamburger menu collapsing to drawer
- Breadcrumb navigation when in team selection (League > Teams)

### Empty States
- Centered illustrations with clear CTAs
- "No teams selected" → "Select your teams to get started" with button
- "No games today" → Subtle icon with next game preview

---

## Interaction Patterns

**Micro-interactions**:
- Card hover: Subtle elevation increase (2px → 4px shadow)
- Checkbox: Smooth check animation
- Date selection: Ripple effect on click
- Filter chips: Toggle with scale animation

**Loading States**:
- Skeleton screens for calendar/game list loads
- Shimmer effect on cards during data fetch

**No complex animations**: Keep transitions snappy and functional (200ms max)

---

## Images

**League Logos**: Official league logos (150x150px) for league selection cards
**Team Logos**: Official team logos (100x100px) throughout interface
**Placement**: 
- League grid: Centered in cards above league name
- Team cards: Left-aligned with checkbox on right
- Game cards: Side-by-side team logos centered
- Calendar tooltips: Small logos (30x30px) in game previews

**No hero image**: Functional app goes straight to league grid on homepage

---

## Accessibility & Responsive

- All interactive elements minimum 44x44px touch targets
- Checkbox labels clickable (entire card triggers selection)
- ARIA labels on icon-only buttons
- Keyboard navigation: Tab through filters, cards, calendar days
- Focus indicators: 2px accent outline on all focusable elements
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Calendar switches to list view on mobile (<640px) for better usability