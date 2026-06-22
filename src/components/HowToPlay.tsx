import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface HowToPlayProps {
  onBack: () => void;
}

export function HowToPlay({ onBack }: HowToPlayProps) {
  return (
    <div className="min-h-screen flex flex-col p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-4">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-neutral-300 hover:bg-zinc-800 hover:text-green-500 h-8 px-3"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-green-500 uppercase tracking-wider text-center font-bold mb-2">
            How to Play
          </h2>
          <div className="h-1 w-20 bg-green-500 mx-auto mb-6" />

          <div className="flex flex-col gap-5">
            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <p className="text-neutral-300 leading-relaxed" style={{ fontSize: '14px' }}>
                Fanatic Bingo is designed to be played alongside a live game. Open your board at anytime during a game, follow along as the action happens, and mark your squares in real time as each moment occurs.
              </p>
            </div>

            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <p className="text-green-500 uppercase tracking-wider font-semibold mb-2" style={{ fontSize: '12px' }}>Private vs. Multiplayer</p>
              <p className="text-neutral-300 leading-relaxed" style={{ fontSize: '14px' }}>
                <span className="text-neutral-200 font-semibold">Private Game</span> — Play solo on your own board at your own pace. Play to five in a row or continue on to get blackout bingo.
              </p>
              <p className="text-neutral-300 leading-relaxed mt-2" style={{ fontSize: '14px' }}>
                <span className="text-neutral-200 font-semibold">Multiplayer</span> — Play with friends watching the same game. The host will decicde between five in a row or blackout bingo, if everyone gets the same terms or different terms. Login with the game code from the host and see who gets bingo first.
              </p>
            </div>

            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <p className="text-green-500 uppercase tracking-wider font-semibold mb-2" style={{ fontSize: '12px' }}>Marking Squares</p>
              <p className="text-neutral-300 leading-relaxed" style={{ fontSize: '14px' }}>
                Tap a square to mark it when that moment happens in the game. The square will highlight to show it's marked. Double-tap a marked square to unmark it if you made a mistake.
              </p>
            </div>

            

            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <p className="text-green-500 uppercase tracking-wider font-semibold mb-2" style={{ fontSize: '12px' }}>Getting Bingo</p>
              <p className="text-neutral-300 leading-relaxed" style={{ fontSize: '14px' }}>
                Get five marked squares in a row to win. Rows, columns, and diagonals all count.
              </p>
            </div>

            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <p className="text-green-500 uppercase tracking-wider font-semibold mb-2" style={{ fontSize: '12px' }}>Free Space</p>
              <p className="text-neutral-300 leading-relaxed" style={{ fontSize: '14px' }}>
                The center square is a free space — it's marked automatically at the start of every game.
              </p>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
