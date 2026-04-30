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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px', width: '50px', flexShrink: 0 }}>
      {Array.from({ length: 25 }, (_, i) => (
        <div
          key={i}
          style={{
            width: '9px',
            height: '9px',
            borderRadius: '1px',
            flexShrink: 0,
            backgroundColor: marked.has(i) ? '#eab308' : '#52525b',
          }}
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {sorted.map((player, i) => {
          const isMe = player.id === myId;
          const rank = i + 1;
          const label = player.initials ?? `P${player.player_number}`;
          const medal = player.bingo && rank <= 3 ? MEDALS[rank - 1] : null;
          return (
            <div
              key={player.id}
              className={`rounded px-2 py-2 ${
                isMe ? 'bg-zinc-800 border border-yellow-500/40' : 'bg-zinc-800/50'
              }`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', minWidth: 0 }}>
                  {medal && <span style={{ fontSize: '13px', lineHeight: 1, flexShrink: 0 }}>{medal}</span>}
                  <span className={`text-xs font-mono truncate ${isMe ? 'text-yellow-400' : 'text-neutral-300'}`}>
                    {label}
                  </span>
                </div>
                <MiniGrid markedSquares={player.squares} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
