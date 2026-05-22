# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000 (auto-opens browser)
npm run build    # Production build → build/ directory
```

No test runner or linter is configured.

## Architecture

Single-page React + Vite + Supabase app. Seven views are managed by a state machine in `App.tsx` via a `view` string state variable — there is no router library. Navigation is done by calling setter functions passed as props.

**View flow:**
`session-lobby` → `sport-selection` → `host-credentials` (multiplayer) or `game` (solo) → `game`

Joining via URL uses a `?join=XXXXX` query parameter which skips to the `guest-login` view.

Session state persists across page loads via `localStorage` (key: `sportsbingo_session`).

## Key Files

- **`src/App.tsx`** — Root component; owns all top-level state and view routing. Also defines `Sport`, `SessionInfo`, and `BingoItem` types.
- **`src/components/BingoBoardV2.tsx`** — Main gameplay component. Handles 5×5 grid rendering, win detection (rows/cols/diagonals), confetti, and real-time multiplayer polling.
- **`src/lib/sessions.ts`** — All Supabase CRUD for sessions and players; real-time subscription via `subscribeToSessionPlayers()`.
- **`src/lib/supabase.ts`** — Supabase client initialization; reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **`src/hooks/useAuth.ts`** — Manages anonymous Supabase auth.
- **`src/components/bingoData.ts`** — Bingo term definitions per sport. Each term has `name`, `icon`, `description`, `group`, and optional `displayName` for long strings.

## Data Model

```typescript
// Supabase tables: sessions, players
interface PlayerRow {
  id: number;
  player_number: number;
  marked_squares: number[];   // indices 0–24 of the board
  initials?: string;
  is_host?: boolean;
}
```

The free space is index 12 (center of 5×5). It uses a sentinel value of `-1` in `bingoData.ts` to identify it.

## Environment Variables

Create a `.env` file at the project root:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## UI System

Components in `src/components/ui/` are composed Radix UI primitives styled with Tailwind. Import them from `@/components/ui/<name>`. Alias paths for all Radix packages are configured in `vite.config.ts`.

The app uses a dark theme by default. Tailwind dark-mode classes (`dark:`) are used throughout.
