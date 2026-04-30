import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RotateCcw, Trophy, Share2, Info } from 'lucide-react';
import { Sport, SessionInfo } from '../App';
import { BingoSquare } from './BingoSquare';
import { getBingoItems, BingoItem } from './bingoData';
import { Button } from './ui/button';
import { Confetti } from './Confetti';
import { supabase } from '../lib/supabase';
import {
  savePlayerBoard,
  loadPlayerBoard,
  getSessionPlayers,
  getSessionById,
  subscribeToSessionPlayers,
  PlayerRow,
} from '../lib/sessions';
import { Leaderboard } from './Leaderboard';

interface BingoBoardProps {
  sport: Sport;
  sessionInfo: SessionInfo | null;
  onBackToSports: () => void;
  onGameEnd: () => void;
}

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


function generateBoardOrder(): number[] {
  const indices = [...Array(12).keys(), ...Array.from({ length: 12 }, (_, i) => i + 13)];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return [...indices.slice(0, 12), 12, ...indices.slice(12)];
}

function boardFromOrder(items: BingoItem[], order: number[]): BingoItem[] {
  return order.map(i => items[i]);
}


function WinOrExpirePopup({
  title,
  message,
  onYes,
  onNo,
  borderColor = 'border-yellow-500',
  icon,
}: {
  title: string;
  message: string;
  onYes: () => void;
  onNo: () => void;
  borderColor?: string;
  icon?: React.ReactNode;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ type: 'spring', damping: 25 }}
          className={`w-full max-w-md bg-zinc-800 border-2 ${borderColor} rounded-lg p-6 text-center`}
        >
          {icon && <div className="flex justify-center mb-3">{icon}</div>}
          <h3 className="text-neutral-200 uppercase tracking-wider mb-3">{title}</h3>
          <p className="text-neutral-400 mb-6">{message}</p>
          <div className="flex gap-3">
            <Button onClick={onNo} variant="outline" className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 h-10">No</Button>
            <Button onClick={onYes} className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-zinc-900 h-10">Yes</Button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

export function BingoBoard({ sport, sessionInfo, onBackToSports, onGameEnd }: BingoBoardProps) {
  const isMultiplayer = !!sessionInfo;
  const imHost = !!sessionInfo?.isHost;

  // Board state
  const [bingoItems, setBingoItems] = useState<BingoItem[]>([]);
  const [boardOrder, setBoardOrder] = useState<number[]>([]);
  const [markedSquares, setMarkedSquares] = useState<Set<number>>(new Set([12]));
  const [boardReady, setBoardReady] = useState(false);
  const [expandedSquare, setExpandedSquare] = useState<number | null>(null);
  const [hasBingo, setHasBingo] = useState(false);

  // Solo win message
  const [showBingoMessage, setShowBingoMessage] = useState(false);

  // Multiplayer state
  const [progressPlayers, setProgressPlayers] = useState<PlayerRow[]>([]);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [show30MinWarning, setShow30MinWarning] = useState(false);
  const [showExpiredPopup, setShowExpiredPopup] = useState(false);
  const [showMultiplayerWin, setShowMultiplayerWin] = useState(false);
  const [showNoThanks, setShowNoThanks] = useState(false);
  const [countdown, setCountdown] = useState(15);

  // UI state
  const [showBackInfo, setShowBackInfo] = useState(false);
  const [copied, setCopied] = useState(false);

  const warned30Ref = useRef(false);
  const allHaveBingoRef = useRef(false);

  // Keep allHaveBingoRef current
  useEffect(() => {
    if (!sessionInfo) return;
    allHaveBingoRef.current = progressPlayers.every(p => {
      const marked = p.id === sessionInfo.playerId
        ? [...markedSquares]
        : (p.marked_squares ?? []);
      return checkBingo(new Set(marked));
    });
  }, [progressPlayers, markedSquares, sessionInfo]);

  // Board init
  useEffect(() => {
    const items = getBingoItems(sport);
    async function init() {
      if (sessionInfo) {
        try {
          const saved = await loadPlayerBoard(sessionInfo.playerId);
          if (saved.board_order?.length === 25) {
            const marked = new Set<number>(
              saved.marked_squares?.length ? saved.marked_squares : [12]
            );
            setBoardOrder(saved.board_order);
            setBingoItems(boardFromOrder(items, saved.board_order));
            setMarkedSquares(marked);
            setHasBingo(checkBingo(marked));
            setBoardReady(true);
            return;
          }
        } catch { /* fall through to new board */ }
        const order = generateBoardOrder();
        setBoardOrder(order);
        setBingoItems(boardFromOrder(items, order));
        await savePlayerBoard(sessionInfo.playerId, order, [12]).catch(() => {});
      } else {
        const order = generateBoardOrder();
        setBoardOrder(order);
        setBingoItems(boardFromOrder(items, order));
      }
      setBoardReady(true);
    }
    init();
  }, [sport, sessionInfo]);

  // Fetch session expiry + all players
  useEffect(() => {
    if (!sessionInfo) return;
    getSessionById(sessionInfo.sessionId)
      .then(s => { if (s?.expires_at) setExpiresAt(new Date(s.expires_at)); })
      .catch(() => {});
    getSessionPlayers(sessionInfo.sessionId)
      .then(players => {
        if (players.length > 0) {
          setProgressPlayers(prev => {
            const byId = new Map(players.map(p => [p.id, p]));
            for (const local of prev) {
              if (!byId.has(local.id)) byId.set(local.id, local);
            }
            return Array.from(byId.values());
          });
        }
      })
      .catch(() => {});
  }, [sessionInfo]);

  // Always keep current player in the progress list using local state as source of truth
  useEffect(() => {
    if (!sessionInfo || !boardReady) return;
    setProgressPlayers(prev => {
      const self: PlayerRow = {
        id: sessionInfo.playerId,
        player_number: 1,
        marked_squares: [...markedSquares],
        initials: sessionInfo.initials,
        is_host: sessionInfo.isHost ?? false,
        joined_at: new Date().toISOString(),
      };
      const exists = prev.some(p => p.id === sessionInfo.playerId);
      return exists
        ? prev.map(p => p.id === sessionInfo.playerId ? { ...p, marked_squares: [...markedSquares] } : p)
        : [...prev, self];
    });
  }, [markedSquares, boardReady, sessionInfo]);

  // Realtime subscription — all players including self
  useEffect(() => {
    if (!sessionInfo) return;

    const merge = (prev: PlayerRow[], incoming: PlayerRow[]) => {
      const byId = new Map(prev.map(p => [p.id, p]));
      for (const p of incoming) byId.set(p.id, { ...byId.get(p.id), ...p });
      return Array.from(byId.values());
    };

    const channel = subscribeToSessionPlayers(sessionInfo.sessionId, updated => {
      setProgressPlayers(prev => merge(prev, [updated]));
    });

    // Re-fetch after subscription is live to pick up players who joined before us.
    // Two fetches: 1.5s and 4s, to handle slow joins and race conditions.
    const fetch = () =>
      getSessionPlayers(sessionInfo.sessionId)
        .then(players => { if (players.length > 0) setProgressPlayers(prev => merge(prev, players)); })
        .catch(() => {});

    const t1 = setTimeout(fetch, 1500);
    const t2 = setTimeout(fetch, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      supabase.removeChannel(channel);
    };
  }, [sessionInfo]);

  // Timer: 30-min warning + expiry detection
  useEffect(() => {
    if (!expiresAt) return;
    warned30Ref.current = false;
    const interval = setInterval(() => {
      const remaining = expiresAt.getTime() - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        setShowExpiredPopup(true);
        return;
      }
      if (!warned30Ref.current && remaining <= 30 * 60 * 1000) {
        if (!allHaveBingoRef.current) {
          warned30Ref.current = true;
          setShow30MinWarning(true);
          setTimeout(() => setShow30MinWarning(false), 60_000);
        }
      }
    }, 10_000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  // Bingo detection
  useEffect(() => {
    if (!checkBingo(markedSquares) || hasBingo) return;
    setHasBingo(true);
    if (isMultiplayer) {
      setShowMultiplayerWin(true);
    } else {
      setShowBingoMessage(true);
      setTimeout(() => setShowBingoMessage(false), 5000);
    }
  }, [markedSquares]);

  // No-thanks countdown
  useEffect(() => {
    if (!showNoThanks) return;
    if (countdown <= 0) {
      window.close();
      setTimeout(() => onGameEnd(), 500);
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [showNoThanks, countdown]);

  const handleConfirmMark = (index: number) => {
    const newMarked = new Set([...markedSquares, index]);
    setMarkedSquares(newMarked);
    setExpandedSquare(null);
    if (sessionInfo) {
      savePlayerBoard(sessionInfo.playerId, boardOrder, [...newMarked], new Date().toISOString()).catch(() => {});
    }
  };

  const handleConfirmUnmark = (index: number) => {
    const newMarked = new Set(markedSquares);
    newMarked.delete(index);
    setMarkedSquares(newMarked);
    setExpandedSquare(null);
    if (sessionInfo) {
      savePlayerBoard(sessionInfo.playerId, boardOrder, [...newMarked]).catch(() => {});
    }
  };

  const handleRestart = () => {
    const items = getBingoItems(sport);
    const order = generateBoardOrder();
    setBoardOrder(order);
    setBingoItems(boardFromOrder(items, order));
    setMarkedSquares(new Set([12]));
    setExpandedSquare(null);
    setHasBingo(false);
    setShowBingoMessage(false);
    setShowMultiplayerWin(false);
    if (sessionInfo) {
      savePlayerBoard(sessionInfo.playerId, order, [12]).catch(() => {});
    }
  };

  const handleShare = async () => {
    if (!sessionInfo?.joinCode) return;
    const link = `${window.location.origin}?join=${sessionInfo.joinCode}`;
    const msg = `${sessionInfo.initials} has invited you to ${sessionInfo.groupName} Bingo. Your code is ${sessionInfo.joinCode}. Sign in at: ${link}`;
    if (navigator.share) {
      try { await navigator.share({ title: `${sessionInfo.groupName} Bingo`, text: msg }); }
      catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(msg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNoThanks = () => {
    setShowMultiplayerWin(false);
    setShowExpiredPopup(false);
    setShowNoThanks(true);
    setCountdown(15);
  };

  if (!boardReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-400">Loading board…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 flex flex-col">
      <Confetti trigger={hasBingo} />

      {/* 30-min warning banner */}
      <AnimatePresence>
        {show30MinWarning && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="fixed top-14 inset-x-4 z-50 max-w-md mx-auto bg-yellow-500 text-zinc-900 rounded px-4 py-2 text-center text-sm font-medium shadow-lg"
          >
            30 minutes until this board expires
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expired pop-up */}
      <AnimatePresence>
        {showExpiredPopup && !showNoThanks && (
          <WinOrExpirePopup
            title="Your Game Has Expired"
            message="Would you like to start a new game?"
            onYes={onGameEnd}
            onNo={handleNoThanks}
            borderColor="border-zinc-600"
          />
        )}
      </AnimatePresence>

      {/* Multiplayer win pop-up */}
      <AnimatePresence>
        {showMultiplayerWin && !showNoThanks && (
          <WinOrExpirePopup
            title="Congratulations!"
            message="Would you like to start a new game?"
            onYes={onGameEnd}
            onNo={handleNoThanks}
            borderColor="border-yellow-500"
            icon={<Trophy className="w-10 h-10 text-yellow-500" />}
          />
        )}
      </AnimatePresence>

      {/* No-thanks countdown */}
      <AnimatePresence>
        {showNoThanks && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto text-center"
            >
              <p className="text-neutral-300 text-lg mb-2">Thank you for playing!</p>
              <p className="text-neutral-500">This page will close in {countdown} seconds.</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Solo bingo banner */}
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

      {/* Header */}
      <div className="flex items-center justify-between mb-2 pt-2">

        {/* Left: Back + optional (i) */}
        <div className="flex items-center gap-1">
          <Button
            onClick={onBackToSports}
            variant="ghost"
            className="text-neutral-300 hover:bg-zinc-800 hover:text-yellow-500 h-8 px-3"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          {(!isMultiplayer || imHost) && (
            <button
              onClick={() => setShowBackInfo(true)}
              className="text-neutral-500 hover:text-yellow-500 transition-colors"
              aria-label="Back info"
            >
              <Info className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Center: sport title (solo) or empty (multiplayer) */}
        {!isMultiplayer && (
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-yellow-500 capitalize uppercase tracking-wider"
          >
            {sport} Bingo
          </motion.h2>
        )}
        {isMultiplayer && <div />}

        {/* Right: Restart (solo), Share (host), empty (guest) */}
        {!isMultiplayer && (
          <Button
            onClick={handleRestart}
            variant="ghost"
            className="text-neutral-300 hover:bg-zinc-800 hover:text-yellow-500 h-8 px-3"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Restart
          </Button>
        )}
        {imHost && (
          <Button
            onClick={handleShare}
            variant="ghost"
            className="text-neutral-300 hover:text-yellow-500 hover:bg-zinc-800 h-8 px-3 border border-zinc-700"
          >
            <Share2 className="w-4 h-4 mr-2" />
            <span className="text-xs">{copied ? 'Copied!' : 'Share'}</span>
          </Button>
        )}
        {!imHost && isMultiplayer && <div className="w-16" />}
      </div>

      {/* Multiplayer subheader */}
      {isMultiplayer && (
        <div className="text-center mb-3">
          <p className="text-yellow-500 uppercase tracking-wider text-base font-medium">
            Team {sessionInfo?.groupName}
          </p>
          <p className="text-neutral-500 text-xs mt-0.5">
            {imHost ? 'I am the host' : `${sessionInfo?.initials}'s Board`}
          </p>
          {imHost && sessionInfo?.joinCode && (
            <p className="text-neutral-400 text-xs mt-1 font-mono tracking-widest">
              Join Code: <span className="text-yellow-500">{sessionInfo.joinCode}</span>
            </p>
          )}
        </div>
      )}

      {/* Grid + leaderboard */}
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
                onClick={() => { if (index !== 12) setExpandedSquare(index); }}
              />
            ))}
          </motion.div>

          {/* Leaderboard — multiplayer only */}
          {isMultiplayer && progressPlayers.length > 0 && sessionInfo && (
            <Leaderboard
              players={progressPlayers}
              myId={sessionInfo.playerId}
              myMarkedSquares={markedSquares}
            />
          )}
      </div>

      {/* Back info sheet */}
      <AnimatePresence>
        {showBackInfo && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowBackInfo(false)}
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
                <h3 className="text-yellow-500 uppercase tracking-wider mb-3">
                  {isMultiplayer ? 'Heads Up' : 'Going Back?'}
                </h3>
                <p className="text-neutral-400 mb-6">
                  {isMultiplayer
                    ? 'Back takes you to the code login screen. Your progress is saved and you can return to your board anytime.'
                    : 'Going back will reset your board. Your progress will be lost and you will start fresh when you return.'}
                </p>
                <Button
                  onClick={() => setShowBackInfo(false)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-zinc-900 h-10"
                >
                  Got It
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Expanded square detail sheet */}
      <AnimatePresence>
        {expandedSquare !== null && (() => {
          const currentItem = bingoItems[expandedSquare];
          const IconComponent = currentItem?.icon;
          return (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setExpandedSquare(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                className="fixed inset-x-0 bottom-0 z-50 bg-zinc-800 border-t-4 border-yellow-500 rounded-t-lg p-5 max-h-[80vh] overflow-y-auto"
              >
                <div className="max-w-md mx-auto">
                  <div className="flex justify-center mb-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring' }}
                      className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded border-2 border-zinc-700"
                    >
                      {IconComponent && <IconComponent className="w-12 h-12 text-zinc-900" />}
                    </motion.div>
                  </div>
                  <h3 className="text-center mb-3 text-neutral-200 uppercase tracking-wide">
                    {currentItem?.name}
                  </h3>
                  <p className="text-center text-neutral-400 mb-6">
                    {currentItem?.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setExpandedSquare(null)}
                      variant="outline"
                      className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 hover:text-neutral-200 h-10"
                    >
                      Cancel
                    </Button>
                    {markedSquares.has(expandedSquare) ? (
                      <Button
                        onClick={() => handleConfirmUnmark(expandedSquare)}
                        variant="outline"
                        className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 hover:text-neutral-200 h-10"
                      >
                        Unmark Square
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleConfirmMark(expandedSquare)}
                        className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-zinc-900 h-10"
                      >
                        Mark Square
                      </Button>
                    )}
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
