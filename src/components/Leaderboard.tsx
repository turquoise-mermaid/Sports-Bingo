import { PlayerRow } from '../lib/sessions';

interface LeaderboardProps {
  players: PlayerRow[];
  myId: number;
  myMarkedSquares: Set<number>;
}

const MEDALS = ['🥇', '🥈', '🥉'];

function MiniGrid({ markedSquares }: { markedSquares: number[] }) {
  const marked = new Set(markedSquares);
  return (
    <div className="grid grid-cols-5 gap-px shrink-0">
      {Array.from({ length: 25 }, (_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-sm ${marked.has(i) ? 'bg-yellow-500' : 'bg-zinc-700'}`}
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
          return (
            <div
              key={player.id}
              className={`flex items-center gap-2 rounded px-2 py-1.5 ${
                isMe
                  ? 'bg-zinc-800 border border-yellow-500/40'
                  : 'bg-zinc-800/50'
              }`}
            >
              <span className="text-base w-7 text-center shrink-0 leading-none">
                {rank <= 3 ? MEDALS[rank - 1] : rank}
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
