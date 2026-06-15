import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Sport } from '../App';
import { BingoSquare } from './BingoSquare';
import { BBExpandedSquareSheet } from './BBExpandedSquareSheet';
import { getBingoItems, BingoItem } from './bingoDataNoIcons';
import { Confetti } from './Confetti';
import { Button } from './ui/button';
import { logEvent } from '../lib/analytics';

const SPORT_NAMES: Record<Sport, string> = {
  soccer: 'Soccer',
  americanFootball: 'Football',
  baseball: 'Baseball',
  basketball: 'Basketball',
  rugby: 'Rugby',
  hockey: 'Hockey',
};

const WINNING_PATTERNS = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

function checkBingo(marked: Set<number>): boolean {
  return WINNING_PATTERNS.some(p => p.every(i => marked.has(i)));
}

function generateBoardOrder(items: BingoItem[]): number[] {
  const shuffled = Array.from({ length: items.length }, (_, i) => i);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const usedGroups = new Set<string>();
  const selected: number[] = [];
  for (const idx of shuffled) {
    if (selected.length === 24) break;
    const group = items[idx].group;
    if (group && usedGroups.has(group)) continue;
    if (group) usedGroups.add(group);
    selected.push(idx);
  }
  return [...selected.slice(0, 12), -1, ...selected.slice(12)];
}

function boardFromOrder(items: BingoItem[], order: number[]): (BingoItem | null)[] {
  return order.map(i => i === -1 ? null : items[i]);
}

interface FirstUseGameBoardProps {
  sport: Sport;
  username?: string;
  userId?: string;
  isDev?: boolean;
  onShowLogin: (mode: 'signin' | 'signup') => void;
  onBack: () => void;
  onBackToLobby: () => void;
  initialHasBingo?: boolean;
}

export function FirstUseGameBoard({ sport, username, userId, isDev, onShowLogin, onBack, onBackToLobby, initialHasBingo }: FirstUseGameBoardProps) {
  const [bingoItems, setBingoItems] = useState<(BingoItem | null)[]>([]);
  const [markedSquares, setMarkedSquares] = useState<Set<number>>(new Set([12]));
  const [expandedSquare, setExpandedSquare] = useState<number | null>(null);
  const doubleClickEnabled = true;
  const [hasBingo, setHasBingo] = useState(initialHasBingo ?? false);
  const [showBanner, setShowBanner] = useState(initialHasBingo ?? false);
  const [showSignUpCard, setShowSignUpCard] = useState(initialHasBingo ?? false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showCloseMessage, setShowCloseMessage] = useState(false);
  const [showNewBoardUpsell, setShowNewBoardUpsell] = useState(false);
  const gameStartedLogged = useRef(false);

  useEffect(() => {
    const items = getBingoItems(sport);
    const order = generateBoardOrder(items);
    setBingoItems(boardFromOrder(items, order));
    if (!initialHasBingo && !gameStartedLogged.current) {
      gameStartedLogged.current = true;
      logEvent({ eventType: 'game_started', sport, isMultiplayer: false, userId }, isDev ?? false);
    }
  }, [sport]);

  useEffect(() => {
    if (!checkBingo(markedSquares) || hasBingo) return;
    setHasBingo(true);
    logEvent({ eventType: 'bingo_achieved', sport, isMultiplayer: false, userId }, isDev ?? false);
    setShowBanner(true);
    setTimeout(() => setShowSignUpCard(true), 1000);
  }, [markedSquares]);

  const handleConfirmMark = (index: number) => {
    setMarkedSquares(prev => new Set([...prev, index]));
    setExpandedSquare(null);
  };

  const handleConfirmUnmark = (index: number) => {
    setMarkedSquares(prev => { const next = new Set(prev); next.delete(index); return next; });
    setExpandedSquare(null);
  };

  const handleBack = () => {
    if (hasBingo) {
      onShowLogin('signup');
    } else {
      logEvent({ eventType: 'game_exited', sport, isMultiplayer: false, hadBingo: false, userId }, isDev ?? false);
      onBack();
    }
  };

  const handleBackToLobby = () => {
    logEvent({ eventType: 'game_exited', sport, isMultiplayer: false, hadBingo: hasBingo, userId }, isDev ?? false);
    onBackToLobby();
  };

  const handleNo = () => {
    setShowThankYou(true);
  };

  const handleExitApp = () => {
    window.close();
    setShowCloseMessage(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0" style={{ opacity: 0.03,
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.5) 10px, rgba(255,255,255,.5) 11px),
                         repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,.5) 10px, rgba(255,255,255,.5) 11px)`
      }} />
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 via-neutral-950/80 to-stone-950/50" />

      <div className="relative z-10 px-2 pt-2">
        {/* Header */}
        <div className="relative flex items-center justify-between mb-1">
          {hasBingo ? (
            <div style={{ width: '80px', height: '32px', backgroundColor: '#09090b' }} />
          ) : (
            <Button
              onClick={handleBack}
              variant="ghost"
              className="text-neutral-300 hover:bg-zinc-800 hover:text-green-500 h-8 px-3"
            >
              <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
              Back
            </Button>
          )}
          <h2
            className="absolute text-green-500 uppercase tracking-wider text-base text-center whitespace-nowrap pointer-events-none"
            style={{ left: '50%', transform: 'translateX(-50%)' }}
          >
            {SPORT_NAMES[sport].toUpperCase()} BINGO
          </h2>
          {!hasBingo ? (
            <Button
              onClick={() => setShowNewBoardUpsell(true)}
              variant="ghost"
              className="text-zinc-600 hover:bg-zinc-800 hover:text-zinc-500 h-8 px-3"
            >
              New Board
            </Button>
          ) : (
            <div style={{ width: '80px' }} />
          )}
        </div>
        <div className="text-center mb-1" style={{ height: '47px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {username && (
            <p className="text-neutral-200" style={{ fontSize: '14px' }}>{username}'s Board</p>
          )}
        </div>

        {/* Board grid */}
        <div className="w-full max-w-md mx-auto">
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
                onClick={() => {
                  if (index === 12) return;
                  if (doubleClickEnabled && !markedSquares.has(index)) handleConfirmMark(index);
                  setExpandedSquare(index);
                }}
                onDoubleClick={doubleClickEnabled && index !== 12 ? () => {
                  if (markedSquares.has(index)) handleConfirmUnmark(index);
                  setExpandedSquare(index);
                } : undefined}
              />
            ))}
          </motion.div>
        </div>
      </div>

      <Confetti trigger={hasBingo && !initialHasBingo} />

      {/* New Board upsell popup */}
      {showNewBoardUpsell && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', padding: '1rem' }}>
          <div className="bg-zinc-800 border-2 border-green-500 rounded-lg p-6 w-full max-w-xs text-center">
            <h3 className="text-neutral-200 font-bold mb-3 uppercase tracking-wide">Get a New Board</h3>
            <p className="text-neutral-400 mb-6" style={{ fontSize: '14px' }}>
              Create a free account to start a new board with a fresh random selection of terms.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowNewBoardUpsell(false)}
                variant="outline"
                className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 h-10"
              >
                Maybe Later
              </Button>
              <Button
                onClick={() => { setShowNewBoardUpsell(false); onShowLogin('signup'); }}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-zinc-900 h-10"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      )}

      <BBExpandedSquareSheet
        item={expandedSquare !== null ? bingoItems[expandedSquare] : null}
        isMarked={expandedSquare !== null && markedSquares.has(expandedSquare)}
        doubleClickMode={doubleClickEnabled}
        onClose={() => setExpandedSquare(null)}
        onMark={() => expandedSquare !== null && handleConfirmMark(expandedSquare)}
        onUnmark={() => expandedSquare !== null && handleConfirmUnmark(expandedSquare)}
      />

      {/* Centered overlay — BINGO! banner + card stacked */}
      <AnimatePresence>
        {showBanner && (
          <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', zIndex: 50, pointerEvents: 'none' }}>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', duration: 0.6 }}
              style={{ pointerEvents: 'auto' }}
            >
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-zinc-900 px-6 py-4 rounded shadow-2xl flex items-center gap-3 border-2 border-zinc-800">
                <Trophy style={{ width: '2.5rem', height: '2.5rem' }} />
                <div>
                  <h2 className="mb-0.5 uppercase tracking-wider">BINGO!</h2>
                  <p>You got five in a row!</p>
                </div>
                <Trophy style={{ width: '2.5rem', height: '2.5rem' }} />
              </div>
            </motion.div>

            {showSignUpCard && (
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                style={{ width: '100%', maxWidth: '28rem', padding: '0 1rem', pointerEvents: 'auto' }}
              >
                <div className="bg-zinc-800 border-2 border-green-500 rounded-lg p-6 text-center">
                  {showThankYou ? (
                    <>
                      <p className="text-neutral-200 mb-5" style={{ fontSize: '15px' }}>
                        Thank you for playing Fanatic Bingo!
                      </p>
                      {showCloseMessage ? (
                        <>
                          <p className="text-neutral-400 mb-4" style={{ fontSize: '14px' }}>
                            You can close this tab.
                          </p>
                          <Button
                            onClick={handleBackToLobby}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-zinc-900 h-10"
                          >
                            Back to Lobby
                          </Button>
                        </>
                      ) : (
                        <div className="flex gap-3">
                          <Button
                            onClick={handleExitApp}
                            variant="outline"
                            className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 h-10"
                          >
                            Exit Application
                          </Button>
                          <Button
                            onClick={handleBackToLobby}
                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-zinc-900 h-10"
                          >
                            Back to Lobby
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-neutral-200 mb-5" style={{ fontSize: '15px' }}>
                        Create a free account to play again.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          onClick={handleNo}
                          variant="outline"
                          className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 h-10"
                        >
                          No
                        </Button>
                        <Button
                          onClick={() => onShowLogin('signup')}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-zinc-900 h-10"
                        >
                          Sign Up
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
