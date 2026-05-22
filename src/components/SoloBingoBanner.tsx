import { AnimatePresence, motion } from 'motion/react';
import { Trophy } from 'lucide-react';

export function SoloBingoBanner({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-zinc-900 px-6 py-4 rounded shadow-2xl flex items-center gap-3 border-2 border-zinc-800">
            <Trophy className="w-10 h-10" />
            <div>
              <h2 className="mb-0.5 uppercase tracking-wider">BINGO!</h2>
              <p>You got five in a row!</p>
            </div>
            <Trophy className="w-10 h-10" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
