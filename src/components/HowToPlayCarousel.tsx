import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from './ui/button';

const GREEN = '#17BB34';
const GREEN_DARK = '#14a12d';

const SLIDES = [
  {
    title: 'Welcome to Fanatic Bingo',
    body: 'Play bingo alongside any live game. Open your board, follow the action, and mark squares as moments happen in real time.',
  },
  {
    title: 'Pick Your Sport',
    body: 'Choose from soccer, football, basketball, baseball, hockey, or rugby. Each sport has its own set of bingo terms tailored to the game.',
  },
  {
    title: 'Your Board',
    body: 'You get a 5×5 board of 25 squares, each one a moment that could happen during the game. The center square is a free space — already marked.',
  },
  {
    title: 'Marking Squares',
    body: "Double-tap a square when that moment happens. Double-tap again to unmark it. Don't know what something means? Long-press any square to get a short explanation.",
  },
  {
    title: 'Getting Bingo',
    body: 'Mark 5 squares in a row — across, down, or diagonal — to win. Keep going to mark every square for Blackout Bingo.',
  },
  {
    title: 'Game Modes',
    body: 'Private: play at your own pace on your own board.\nMultiplayer: a host creates a game and shares a code. Everyone joins and sees who gets bingo first.',
  },
  {
    title: 'Multiplayer Tips',
    body: 'The host sets the win condition (bingo or blackout) and whether everyone shares the same terms.\nGuests join anytime during the game — your board waits for you.',
  },
];

interface HowToPlayCarouselProps {
  onDone: () => void;
}

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
};

export function HowToPlayCarousel({ onDone }: HowToPlayCarouselProps) {
  const [[index, direction], setSlide] = useState([0, 0]);

  const go = (newIndex: number, dir: number) => {
    if (newIndex < 0 || newIndex >= SLIDES.length) return;
    setSlide([newIndex, dir]);
  };

  const handleDragEnd = (_: unknown, { offset, velocity }: { offset: { x: number }; velocity: { x: number } }) => {
    const swipe = offset.x * Math.abs(velocity.x);
    if (swipe < -500) go(index + 1, 1);
    else if (swipe > 500) go(index - 1, -1);
  };

  const isLast = index === SLIDES.length - 1;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#18181b' }}>

      {/* Header: title centered, X pinned right */}
      <div className="w-full flex items-center justify-between px-4 pb-2" style={{ paddingTop: '48px' }}>
        <div style={{ width: '20px' }} />
        <p className="text-green-500 uppercase tracking-wider font-semibold" style={{ fontSize: '20px' }}>How to Play</p>
        <button
          type="button"
          onClick={onDone}
          className="text-neutral-500 hover:text-neutral-200 transition-colors"
          aria-label="Skip"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="h-0.5 w-16 mx-auto mb-2" style={{ backgroundColor: GREEN }} />

      {/* Slide area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden px-6">
        <AnimatePresence custom={direction} mode="wait" initial={false}>
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', duration: 0.25 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            className="w-full max-w-md flex flex-col items-center text-center gap-6 select-none"
          >
            <p className="text-neutral-600 font-mono" style={{ fontSize: '12px' }}>
              {index + 1} / {SLIDES.length}
            </p>
            <h2 className="text-green-500 uppercase tracking-wider font-bold" style={{ fontSize: '20px' }}>
              {SLIDES[index].title}
            </h2>
            <div className="h-0.5 w-16" style={{ backgroundColor: GREEN }} />
            <p className="text-neutral-300 leading-relaxed whitespace-pre-line" style={{ fontSize: '16px' }}>
              {SLIDES[index].body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-6 flex flex-col items-center gap-4">
        {/* Dots */}
        <div className="flex gap-2 items-center">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i, i > index ? 1 : -1)}
              className="rounded-full transition-all duration-200"
              style={{
                width: i === index ? '20px' : '8px',
                height: '8px',
                backgroundColor: i === index ? GREEN : '#52525b',
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Prev / Next / Done */}
        <div className="flex items-center gap-3 w-full max-w-md">
          <Button
            type="button"
            onClick={() => go(index - 1, -1)}
            variant="ghost"
            disabled={index === 0}
            className="text-neutral-400 hover:text-green-500 hover:bg-zinc-800 h-11 px-4 disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            type="button"
            onClick={isLast ? onDone : () => go(index + 1, 1)}
            className="flex-1 h-11 text-zinc-900 font-semibold"
            style={{ background: `linear-gradient(to right, ${GREEN}, ${GREEN_DARK})` }}
          >
            {isLast ? "Let's Play!" : 'Next'}
          </Button>
          <Button
            type="button"
            onClick={() => go(index + 1, 1)}
            variant="ghost"
            disabled={isLast}
            className="text-neutral-400 hover:text-green-500 hover:bg-zinc-800 h-11 px-4 disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

    </div>
  );
}
