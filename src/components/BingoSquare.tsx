import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { BingoItem } from './bingoDataNoIcons';

interface BingoSquareProps {
  item: BingoItem;
  index: number;
  isMarked: boolean;
  isFreeSpace: boolean;
  onClick: () => void;
}

export function BingoSquare({ item, isMarked, isFreeSpace, onClick }: BingoSquareProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
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
      {/* Label */}
      <span style={{ fontSize: '12px' }} className={`text-center leading-tight font-medium ${isMarked || isFreeSpace ? 'text-zinc-900' : 'text-neutral-200'}`}>
        {isFreeSpace ? 'FREE' : item.name}
      </span>

      {/* Check mark overlay */}
      {isMarked && !isFreeSpace && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 flex items-center justify-center rounded border border-zinc-700" style={{ backgroundColor: 'rgba(23,187,52,0.9)' }}
        >
          <Check className="w-6 h-6 text-zinc-900" strokeWidth={3} />
        </motion.div>
      )}
    </motion.button>
  );
}
