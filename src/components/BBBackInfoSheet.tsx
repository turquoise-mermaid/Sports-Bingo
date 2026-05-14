import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';

interface BBBackInfoSheetProps {
  isOpen: boolean;
  isMultiplayer: boolean;
  onClose: () => void;
}

export function BBBackInfoSheet({ isOpen, isMultiplayer, onClose }: BBBackInfoSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
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
            className="fixed inset-x-0 bottom-0 z-50 bg-zinc-800 border-t-4 border-green-500 rounded-t-lg p-5"
          >
            <div className="max-w-md mx-auto text-center">
              <h3 className="text-green-500 uppercase tracking-wider mb-3">
                {isMultiplayer ? 'Heads Up' : 'Going Back?'}
              </h3>
              <p className="text-neutral-400 mb-6">
                {isMultiplayer
                  ? 'Back takes you to the code login screen. Your progress is saved and you can return to your board anytime.'
                  : 'Going back will reset your board. Your progress will be lost and you will start fresh when you return.'}
              </p>
              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-zinc-900 h-10"
              >
                Got It
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
