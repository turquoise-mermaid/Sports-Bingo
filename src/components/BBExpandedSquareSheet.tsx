import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { BingoItem } from './bingoDataNoIcons';

interface BBExpandedSquareSheetProps {
  item: BingoItem | null;
  onClose: () => void;
}

export function BBExpandedSquareSheet({ item, onClose }: BBExpandedSquareSheetProps) {
  return (
    <AnimatePresence>
      {item !== null && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-zinc-800 border-t-4 border-green-500 rounded-t-lg p-5 overflow-y-auto"
            style={{ maxHeight: '80vh' }}
          >
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-300 transition-colors"
                aria-label="Close"
              >
                <X style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
              <h3 className="text-center mb-3 text-neutral-200 uppercase tracking-wide">
                {item.name}
              </h3>
              <p className="text-center text-neutral-400 mb-6">
                {item.description}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
