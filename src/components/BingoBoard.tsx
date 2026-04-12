import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import { Sport } from '../App';
import { BingoSquare } from './BingoSquare';
import { getBingoItems, BingoItem } from './bingoData';
import { Button } from './ui/button';
import { Confetti } from './Confetti';

interface BingoBoardProps {
  sport: Sport;
  onBackToSports: () => void;
}

// Define all possible bingo winning patterns
const WINNING_PATTERNS = [
  // Rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  // Columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  // Diagonals
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

function checkBingo(markedSquares: Set<number>): boolean {
  return WINNING_PATTERNS.some((pattern) =>
    pattern.every((index) => markedSquares.has(index))
  );
}

export function BingoBoard({ sport, onBackToSports }: BingoBoardProps) {
  const [markedSquares, setMarkedSquares] = useState<Set<number>>(new Set([12])); // Middle square is pre-marked
  const [expandedSquare, setExpandedSquare] = useState<number | null>(null);
  const [hasBingo, setHasBingo] = useState(false);
  const [showBingoMessage, setShowBingoMessage] = useState(false);
  const bingoItems = getBingoItems(sport);

  // Check for bingo whenever marked squares change
  useEffect(() => {
    const isBingo = checkBingo(markedSquares);
    if (isBingo && !hasBingo) {
      setHasBingo(true);
      setShowBingoMessage(true);
      // Hide message after 5 seconds
      setTimeout(() => setShowBingoMessage(false), 5000);
    }
  }, [markedSquares, hasBingo]);

  const handleSquareClick = (index: number) => {
    if (index !== 12) { // Don't expand free space
      setExpandedSquare(index);
    }
  };

  const handleConfirmMark = (index: number) => {
    setMarkedSquares(prev => new Set([...prev, index]));
    setExpandedSquare(null);
  };

  const handleCloseExpanded = () => {
    setExpandedSquare(null);
  };

  const handleRestart = () => {
    setMarkedSquares(new Set([12]));
    setExpandedSquare(null);
    setHasBingo(false);
    setShowBingoMessage(false);
  };

  return (
    <div className="min-h-screen p-4 flex flex-col">
      {/* Confetti */}
      <Confetti trigger={hasBingo} />

      {/* Bingo Victory Message */}
      <AnimatePresence>
        {showBingoMessage && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-zinc-900 px-6 py-4 rounded shadow-2xl flex items-center gap-3 border-2 border-zinc-800">
              <Trophy className="w-10 h-10 text-zinc-900" />
              <div>
                <h2 className="text-zinc-900 mb-0.5 uppercase tracking-wider">BINGO!</h2>
                <p className="text-zinc-800">You got five in a row!</p>
              </div>
              <Trophy className="w-10 h-10 text-zinc-900" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 pt-2">
        <Button
          onClick={onBackToSports}
          variant="ghost"
          className="text-neutral-300 hover:bg-zinc-800 hover:text-yellow-500 h-8 px-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-yellow-500 capitalize uppercase tracking-wider"
        >
          {sport} Bingo
        </motion.h2>
        <Button
          onClick={handleRestart}
          variant="ghost"
          className="text-neutral-300 hover:bg-zinc-800 hover:text-yellow-500 h-8 px-3"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Restart
        </Button>
      </div>

      {/* Bingo Grid */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="grid grid-cols-5 gap-1.5 bg-zinc-800/50 backdrop-blur-sm p-2 rounded shadow-2xl border-2 border-zinc-700"
          >
            {bingoItems.map((item, index) => (
              <BingoSquare
                key={index}
                item={item}
                index={index}
                isMarked={markedSquares.has(index)}
                isFreeSpace={index === 12}
                onClick={() => handleSquareClick(index)}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Expanded Square Detail */}
      <AnimatePresence>
        {expandedSquare !== null && (() => {
          const currentItem = bingoItems[expandedSquare];
          const IconComponent = currentItem?.icon;
          
          return (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseExpanded}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />

              {/* Expanded Card */}
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                className="fixed inset-x-0 bottom-0 z-50 bg-zinc-800 border-t-4 border-yellow-500 rounded-t-lg p-5 max-h-[80vh] overflow-y-auto"
              >
                <div className="max-w-md mx-auto">
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring' }}
                      className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded border-2 border-zinc-700"
                    >
                      {IconComponent && (
                        <IconComponent className="w-12 h-12 text-zinc-900" />
                      )}
                    </motion.div>
                  </div>

                  {/* Title */}
                  <h3 className="text-center mb-3 text-neutral-200 uppercase tracking-wide">
                    {currentItem?.name}
                  </h3>

                  {/* Description */}
                  <p className="text-center text-neutral-400 mb-6">
                    {currentItem?.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCloseExpanded}
                      variant="outline"
                      className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 hover:text-neutral-200 h-10"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleConfirmMark(expandedSquare)}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-zinc-900 h-10"
                      disabled={markedSquares.has(expandedSquare)}
                    >
                      {markedSquares.has(expandedSquare) ? 'Already Marked' : 'Mark Square'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
