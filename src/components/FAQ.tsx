import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';

interface FAQProps {
  onBack: () => void;
}

const faqs = [
  {
    q: 'How do I play Fanatic Bingo?',
    a: 'Enter a username and choose Private, Multiplayer, or Join Game. Pick a sport, then mark off squares on your bingo board as those events happen during a live game. Get five in a row — horizontally, vertically, or diagonally — to win!',
  },
  {
    q: 'What is the Free Space?',
    a: 'The center square is a Free Space and is automatically marked for you at the start of every game.',
  },
  {
    q: 'How do I mark a square?',
    a: 'Double-tap a square to mark it when that moment happens in the game. Double-tap it again to unmark it if you made a mistake. Long-press any square to see what it means.',
  },
  {
    q: 'What is Blackout Bingo?',
    a: 'Blackout Bingo is an alternate win condition where you need to mark every single square on the board instead of just five in a row. In multiplayer, the host chooses between standard Bingo (five in a row) and Blackout before the game starts.',
  },
  {
    q: 'What does "Shared Terms" mean in multiplayer?',
    a: 'When the host enables Shared Terms, every player gets the exact same set of bingo terms on their board — just arranged in a different order. With Shared Terms off, each player gets a different random selection of terms. The host sets this option before the game starts.',
  },
  {
    q: 'How do I create a multiplayer game?',
    a: 'Choose Multiplayer from the lobby, set your team name and username, then share the generated game code with up to five friends.',
  },
  {
    q: 'How do I join a multiplayer game?',
    a: 'Two ways to join: The host will send a link with a join code directly, where a username and the 6-character code can be entered directly. Or, tap Join Game in the lobby and enter your username and 6-character code your host shared with you.',
  },
  {
    q: 'How long does a multiplayer session last?',
    a: 'Multiplayer sessions expire after 24 hours or when the host ends the game. You\'ll get a 30-minute warning before time runs out.',
  },
  {
    q: 'Can I rejoin a game if I leave?',
    a: 'Yes! Your progress is saved. If you close the app and come back, you\'ll be taken straight back to your game automatically.',
  },
  {
    q: 'What happens when someone gets Bingo?',
    a: 'You\'ll see a congratulations screen. You can choose to start a fresh new game or keep your current board.',
  },
  {
    q: 'Do you collect personal data?',
    a: 'No. The only data that is collected are browser cookies. That allows you to save your progress and get back into the game if you hit refresh.',
  },
];

export function FAQ({ onBack }: FAQProps) {
  const [open, setOpen] = useState<number | null>(null);

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
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-green-500 uppercase tracking-wider mb-1">FAQs</h2>
            <div className="h-1 w-20 bg-green-500 mx-auto mb-3" />
            <p className="text-neutral-400 text-sm">Frequently asked questions</p>
          </div>

          <div className="flex flex-col gap-2">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="bg-zinc-800 border border-zinc-700 rounded overflow-hidden"
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left text-neutral-200 hover:bg-zinc-700/50 transition-colors"
                >
                  <span className="text-sm font-medium pr-2">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: open === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0"
                  >
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-neutral-400 text-sm px-4 pb-4 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
