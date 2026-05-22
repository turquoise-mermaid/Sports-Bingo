# Branch Changes — `initial-edit`

## Refactoring

### `BingoBoardV2` decomposition
- Extracted pure game logic (`WINNING_PATTERNS`, `checkBingo`, `generateBoardOrder`, `boardFromOrder`) into `src/lib/bingoGame.ts`; `Leaderboard` now imports `WINNING_PATTERNS` from there instead of maintaining a duplicate
- Extracted all state, effects, and handlers into a custom hook `src/hooks/useBingoGame.ts`
- Extracted the solo bingo trophy animation into `src/components/SoloBingoBanner.tsx`
- Extracted the win/expire modal into `src/components/WinOrExpirePopup.tsx`
- `BingoBoardV2.tsx` reduced from ~430 lines to ~130 lines of pure JSX

### `PlayerRow` type fix (`src/lib/sessions.ts`)
- `marked_squares` typed as `number[] | null` to reflect actual Supabase response

## Board & Gameplay

- **Free space:** center square (index 12) hardcoded via a `-1` sentinel value in `bingoData.ts` rather than being drawn from the term pool
- **Term pool shuffling:** fixed so the board is properly randomized on each new game
- **Win detection:** rows, columns, and diagonals all checked correctly

## UI

- **Board header:** fixed layout for sport label, player info, and action buttons
- **Term text size:** increased from 12px to 13px for readability
- **`displayName` field:** added to term definitions for long strings that need a shortened label on the board
- **Watermark:** commented out

## Developer Experience

- **`CLAUDE.md`:** added project documentation for Claude Code (architecture, key files, data model, commands)
- **`tsconfig.json`:** added TypeScript config
- **DevNav:** floating dev-only navigation component for quick screen previews; commented out for production builds (kept in codebase for easy re-enabling)
- **`group` field:** added to term definitions for future grouping/filtering use
