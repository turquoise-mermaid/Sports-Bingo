import { PlayerRow } from '../lib/sessions';

interface LeaderboardProps {
  players: PlayerRow[];
  myId: number;
  myMarkedSquares: Set<number>;
}

const MEDALS = ['🥇', '🥈', '🥉'];

const WINNING_PATTERNS = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

function hasBingo(squares: number[]): boolean {
  const marked = new Set(squares);
  return WINNING_PATTERNS.some(p => p.every(i => marked.has(i)));
}

function MiniGrid({ markedSquares }: { markedSquares: number[] }) {
  const marked = new Set(markedSquares);
  return (
    <div className="flex flex-wrap gap-px shrink-0 w-[54px]">
      {Array.from({ length: 25 }, (_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-sm ${marked.has(i) ? 'bg-yellow-500' : 'bg-zinc-600'}`}
        />
      ))}
    </div>
  );
}

export function Leaderboard({ players, myId, myMarkedSquares }: LeaderboardProps) {
  const sorted = [...players]
    .map(p => ({
      ...p,
      squares: p.id === myId ? [...myMarkedSquares] : (p.marked_squares ?? []),
    }))
    .map(p => ({ ...p, bingo: hasBingo(p.squares) }))
    .sort((a, b) => {
      const countDiff = b.squares.length - a.squares.length;
      if (countDiff !== 0) return countDiff;
      const aTime = a.last_marked_at ? new Date(a.last_marked_at).getTime() : Infinity;
      const bTime = b.last_marked_at ? new Date(b.last_marked_at).getTime() : Infinity;
      return aTime - bTime;
    });

  return (
    <div className="mt-5 w-full">
      <p className="text-neutral-500 text-xs uppercase tracking-wider text-center mb-2">Leaderboard</p>
      <div className="flex flex-col gap-1.5">
        {sorted.map((player, i) => {
          const isMe = player.id === myId;
          const rank = i + 1;
          const label = player.initials ?? `P${player.player_number}`;
          const rankDisplay = player.bingo && rank <= 3 ? MEDALS[rank - 1] : null;
          return (
            <div
              key={player.id}
              className={`flex items-center gap-2 rounded px-2 py-1.5 ${
                isMe ? 'bg-zinc-800 border border-yellow-500/40' : 'bg-zinc-800/50'
              }`}
            >
              <span className="text-base w-7 text-center shrink-0 leading-none">
                {rankDisplay}
              </span>
              <span
                className={`text-xs font-mono flex-1 min-w-0 truncate ${
                  isMe ? 'text-yellow-400' : 'text-neutral-300'
                }`}
              >
                {label}
              </span>
              <MiniGrid markedSquares={player.squares} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
