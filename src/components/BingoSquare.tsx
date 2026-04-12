import { motion } from 'motion/react';
import { Check, Star } from 'lucide-react';
import { BingoItem } from './bingoData';

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
        ${isFreeSpace 
          ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 border border-zinc-700' 
          : isMarked 
            ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 border border-zinc-700' 
            : 'bg-zinc-700 hover:bg-zinc-600 border border-zinc-600'
        }
        shadow-md hover:shadow-lg
      `}
    >
      {/* Icon */}
      {isFreeSpace ? (
        <Star className="w-5 h-5 text-zinc-900 fill-zinc-900" />
      ) : (
        <item.icon className={`w-5 h-5 ${isMarked ? 'text-zinc-900' : 'text-neutral-300'}`} />
      )}

      {/* Label */}
      <span className={`text-[8px] mt-0.5 text-center leading-tight ${isMarked || isFreeSpace ? 'text-zinc-900' : 'text-neutral-400'}`}>
        {isFreeSpace ? 'FREE' : item.name}
      </span>

      {/* Check mark overlay */}
      {isMarked && !isFreeSpace && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-yellow-500/90 rounded border border-zinc-700"
        >
          <Check className="w-6 h-6 text-zinc-900" strokeWidth={3} />
        </motion.div>
      )}
    </motion.button>
  );
}
