import { motion } from 'motion/react';
// import { Activity } from 'lucide-react'; // watermark icon — re-enable when ready
import { Star } from 'lucide-react';
import { BingoItem } from './bingoDataNoIcons';

interface BingoSquareProps {
  item: BingoItem | null;
  index: number;
  isMarked: boolean;
  isFreeSpace: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
}

const DISPLAY_REPLACEMENTS: [RegExp, string][] = [
  [/\bReferee\b/gi, 'Ref'],
  [/\bTouchdown\b/gi, 'TD'],
  [/\bFirst\b/gi, '1st'],
  [/\bSecond\b/gi, '2nd'],
  [/\bThird\b/gi, '3rd'],
  [/\bIntroductions\b/gi, 'Intros'],
  [/\bInterference\b/gi, 'Interfer'],
  [/\bInterception\b/gi, 'Intrcp'],
  [/\bSubstitution\b/gi, 'Subs'],
  [/\bUnsportsmanlike\b/gi, 'Unsportsman-like'],
  [/\bEmbellishment\b/gi, 'Embellish'],
  [/\bCheerleaders\b/gi, 'Cheerleader'],
  [/\bEncroachment\b/gi, 'Encroach'],
];

function displayName(name: string): string {
  return DISPLAY_REPLACEMENTS.reduce((s, [pattern, replacement]) => s.replace(pattern, replacement), name);
}

export function BingoSquare({ item, isMarked, isFreeSpace, onClick, onDoubleClick }: BingoSquareProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`
        relative aspect-square rounded p-1.5 flex flex-col items-center justify-center
        transition-all duration-300
        ${isFreeSpace || isMarked
          ? 'border border-zinc-700'
          : 'bg-zinc-700 hover:bg-zinc-600 border border-zinc-600'
        }
        shadow-md hover:shadow-lg
      `}
      style={isFreeSpace || isMarked ? { background: 'linear-gradient(to bottom right, #17BB34, #14a12d)' } : undefined}
    >
      {/* Watermark icon — uncomment to re-enable */}
      {/* {!isFreeSpace && !isMarked && (
        <Activity
          style={{ position: 'absolute', width: '50px', height: '50px', color: '#17BB34', opacity: 0.3 }}
          strokeWidth={1.5}
        />
      )} */}
      {isFreeSpace && (
        <Star
          style={{ position: 'absolute', width: '70px', height: '70px', color: '#18181b', opacity: 0.3 }}
          strokeWidth={1.5}
          fill="#18181b"
        />
      )}

      {/* Label — on top of icon */}
      <span style={{ fontSize: '13px', position: 'relative' }} className={`text-center leading-tight font-medium ${isMarked || isFreeSpace ? 'text-zinc-900' : 'text-neutral-200'}`}>
        {isFreeSpace ? 'FREE' : displayName(item?.name ?? '')}
      </span>

    </motion.button>
  );
}
