import { motion, AnimatePresence } from 'motion/react';
import { BingoItem } from './bingoDataNoIcons';
import { Button } from './ui/button';

interface BBExpandedSquareSheetProps {
  item: BingoItem | null;
  isMarked: boolean;
  onClose: () => void;
  onMark: () => void;
  onUnmark: () => void;
}

export function BBExpandedSquareSheet({ item, isMarked, onClose, onMark, onUnmark }: BBExpandedSquareSheetProps) {
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
              <h3 className="text-center mb-3 text-neutral-200 uppercase tracking-wide">
                {item.name}
              </h3>
              <p className="text-center text-neutral-400 mb-6">
                {item.description}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 hover:text-neutral-200 h-10"
                >
                  Cancel
                </Button>
                {isMarked ? (
                  <Button
                    onClick={onUnmark}
                    variant="outline"
                    className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 hover:text-neutral-200 h-10"
                  >
                    Unmark Square
                  </Button>
                ) : (
                  <Button
                    onClick={onMark}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-zinc-900 h-10"
                  >
                    Mark Square
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
