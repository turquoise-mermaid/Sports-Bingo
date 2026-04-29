import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Sport } from '../App';
import { Button } from './ui/button';

interface SessionLobbyProps {
  user: SupabaseUser;
  onSolo: () => void;
  onMultiplayerCreate: () => void;
  onJoinReady: (sessionId: number, playerId: number, sport: Sport) => void;
}

const INFO = {
  solo: {
    title: 'Solo',
    description: 'Play on your own. Mark off terms as they happen during the game and see if you can get bingo.',
  },
  multiplayer: {
    title: 'Multiplayer',
    description: 'Play with up to 4 friends. Share a game code and everyone gets the same terms on a different board. First to bingo wins.',
  },
};

export function SessionLobby({ onSolo, onMultiplayerCreate }: SessionLobbyProps) {
  const [infoPopup, setInfoPopup] = useState<'solo' | 'multiplayer' | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h2 className="text-yellow-500 uppercase tracking-wider mb-1">Sports Bingo</h2>
          <div className="h-1 w-20 bg-yellow-500 mx-auto mb-3" />
          <p className="text-neutral-400">How do you want to play?</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 shrink-0" />
            <Button
              onClick={onSolo}
              className="flex-1 bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-neutral-200 border-2 border-yellow-500 h-14 text-lg justify-center"
            >
              Solo
            </Button>
            <button
              onClick={() => setInfoPopup('solo')}
              className="text-neutral-400 hover:text-yellow-500 transition-colors p-2 w-9 shrink-0"
              aria-label="Solo info"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-9 shrink-0" />
            <Button
              onClick={onMultiplayerCreate}
              className="flex-1 bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-neutral-200 border-2 border-yellow-500 h-14 text-lg justify-center"
            >
              Multiplayer
            </Button>
            <button
              onClick={() => setInfoPopup('multiplayer')}
              className="text-neutral-400 hover:text-yellow-500 transition-colors p-2 w-9 shrink-0"
              aria-label="Multiplayer info"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Info bottom sheet */}
      <AnimatePresence>
        {infoPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setInfoPopup(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-zinc-800 border-t-4 border-yellow-500 rounded-t-lg p-5"
            >
              <div className="max-w-md mx-auto text-center">
                <h3 className="text-neutral-200 uppercase tracking-wide mb-3">
                  {INFO[infoPopup].title}
                </h3>
                <p className="text-neutral-400 mb-6">
                  {INFO[infoPopup].description}
                </p>
                <Button
                  onClick={() => setInfoPopup(null)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-zinc-900 h-10"
                >
                  Ok
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
