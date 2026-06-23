import { useRef } from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { BingoItem } from './bingoDataNoIcons';

interface BingoSquareProps {
  item: BingoItem | null;
  index: number;
  isMarked: boolean;
  isFreeSpace: boolean;
  onClick: () => void;
  onLongPress?: () => void;
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

export function BingoSquare({ item, isMarked, isFreeSpace, onClick, onLongPress }: BingoSquareProps) {
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPressRef = useRef(false);
  const lastTapRef = useRef<number>(0);

  const startPress = () => {
    if (isFreeSpace) return;
    didLongPressRef.current = false;
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        didLongPressRef.current = true;
        onLongPress();
      }, 500);
    }
  };

  const cancelPress = () => {
    if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }
  };

  const handleClick = () => {
    if (didLongPressRef.current) { didLongPressRef.current = false; return; }
    if (isFreeSpace) return;
    const now = Date.now();
    const gap = now - lastTapRef.current;
    lastTapRef.current = now;
    if (gap < 300) onClick();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      onTouchMove={cancelPress}
      onClick={handleClick}
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
      {isFreeSpace && (
        <Star
          style={{ position: 'absolute', width: '70px', height: '70px', color: '#18181b', opacity: 0.3 }}
          strokeWidth={1.5}
          fill="#18181b"
        />
      )}
      <span style={{ fontSize: '13px', position: 'relative' }} className={`text-center leading-tight font-medium ${isMarked || isFreeSpace ? 'text-zinc-900' : 'text-neutral-200'}`}>
        {isFreeSpace ? 'FREE' : displayName(item?.name ?? '')}
      </span>
    </motion.button>
  );
}
