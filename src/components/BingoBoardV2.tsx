import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Info } from 'lucide-react';
import { Sport, SessionInfo } from '../App';
import { BingoSquare } from './BingoSquare';
import { getBingoItems, BingoItem } from './bingoDataNoIcons';
import { Button } from './ui/button';
import { Confetti } from './Confetti';
import { supabase } from '../lib/supabase';
import {
  savePlayerBoard,
  loadPlayerBoard,
  getSessionPlayers,
  getSessionById,
  subscribeToSessionPlayers,
  subscribeToSessionUpdate,
  confirmSharedTerms,
  endSession,
  PlayerRow,
} from '../lib/sessions';
import { Leaderboard } from './Leaderboard';
import { BBBoardHeader } from './BBBoardHeader';
import { BBBackInfoSheet } from './BBBackInfoSheet';
import { BBExpandedSquareSheet } from './BBExpandedSquareSheet';
import { logEvent } from '../lib/analytics';

const GREEN = '#17BB34';
const GREEN_DARK = '#14a12d';

interface BingoBoardV2Props {
  sport: Sport;
  sessionInfo: SessionInfo | null;
  username?: string;
  userId?: string;
  isDev?: boolean;
  gameMode?: 'bingo' | 'blackout';
  useSharedTerms?: boolean;
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

function generateBoardFromTermIndices(termIndices: number[]): number[] {
  const shuffled = [...termIndices];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return [...shuffled.slice(0, 12), -1, ...shuffled.slice(12)];
}

function boardFromOrder(items: BingoItem[], order: number[]): (BingoItem | null)[] {
  return order.map(i => i === -1 ? null : items[i]);
}

const PENDING_BOARD_KEY = 'sportsbingo_pending_board';

export function BingoBoardV2({ sport, sessionInfo, username, userId, isDev, gameMode = 'bingo', useSharedTerms = false, onBackToSports, onGameEnd }: BingoBoardV2Props) {
  const isMultiplayer = !!sessionInfo;
  const imHost = !!sessionInfo?.isHost;
  const isBlackoutMode = gameMode === 'blackout';

  // Board state
  const [bingoItems, setBingoItems] = useState<(BingoItem | null)[]>([]);
  const [boardOrder, setBoardOrder] = useState<number[]>([]);
  const [markedSquares, setMarkedSquares] = useState<Set<number>>(new Set([12]));
  const [boardReady, setBoardReady] = useState(false);
  const [expandedSquare, setExpandedSquare] = useState<number | null>(null);
  const [hasBingo, setHasBingo] = useState(false);

  // Solo win states
  const [showBingoMessage, setShowBingoMessage] = useState(false);
  const [showBlackoutChoice, setShowBlackoutChoice] = useState(false);
  const [blackoutMode, setBlackoutMode] = useState(false);
  const [hasBlackout, setHasBlackout] = useState(false);
  const [showBlackoutWin, setShowBlackoutWin] = useState(false);
  const [showBlackoutInfo, setShowBlackoutInfo] = useState(false);

  // Multiplayer state
  const [progressPlayers, setProgressPlayers] = useState<PlayerRow[]>([]);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [show30MinWarning, setShow30MinWarning] = useState(false);
  const [showExpiredPopup, setShowExpiredPopup] = useState(false);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [showHostEndedPopup, setShowHostEndedPopup] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState('');

  // Shared terms state
  const [shufflesRemaining, setShufflesRemaining] = useState(3);
  const [termsConfirmed, setTermsConfirmed] = useState(false);
  const [waitingForHost, setWaitingForHost] = useState(false);
  const [showShuffleInfo, setShowShuffleInfo] = useState(false);
  const [showShareInfo, setShowShareInfo] = useState(false);

  // UI state
  const [showBackInfo, setShowBackInfo] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const warned30Ref = useRef(false);
  const allHaveBingoRef = useRef(false);
  const hostEndedShownRef = useRef(false);

  useEffect(() => {
    if (!sessionInfo) return;
    allHaveBingoRef.current = progressPlayers.every(p => {
      const marked = p.id === sessionInfo.playerId
        ? [...markedSquares]
        : (p.marked_squares ?? []);
      return isBlackoutMode
        ? marked.length === 25
        : checkBingo(new Set(marked));
    });
  }, [progressPlayers, markedSquares, sessionInfo, isBlackoutMode]);

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
            setHasBingo(isBlackoutMode ? marked.size === 25 : checkBingo(marked));
            if (imHost && useSharedTerms) {
              const session = await getSessionById(sessionInfo.sessionId).catch(() => null);
              if (session?.shared_terms?.length) setTermsConfirmed(true);
            }
            setBoardReady(true);
            return;
          }
        } catch { /* fall through */ }

        if (!imHost && useSharedTerms) {
          const session = await getSessionById(sessionInfo.sessionId).catch(() => null);
          if (session?.shared_terms?.length === 24) {
            const order = generateBoardFromTermIndices(session.shared_terms);
            setBoardOrder(order);
            setBingoItems(boardFromOrder(items, order));
            await savePlayerBoard(sessionInfo.playerId, order, [12]).catch(() => {});
          } else {
            setWaitingForHost(true);
            setBoardReady(true);
            return;
          }
        } else {
          const order = generateBoardOrder(items);
          setBoardOrder(order);
          setBingoItems(boardFromOrder(items, order));
          await savePlayerBoard(sessionInfo.playerId, order, [12]).catch(() => {});
        }
      } else {
        // Solo: restore board saved before signup navigation
        const pending = localStorage.getItem(PENDING_BOARD_KEY);
        if (pending) {
          try {
            const { boardOrder: savedOrder, markedSquares: savedMarked, blackoutMode: savedBlackout } = JSON.parse(pending);
            localStorage.removeItem(PENDING_BOARD_KEY);
            setBoardOrder(savedOrder);
            setBingoItems(boardFromOrder(items, savedOrder));
            setMarkedSquares(new Set<number>(savedMarked));
            setHasBingo(true);
            if (savedBlackout) setBlackoutMode(true);
            setBoardReady(true);
            return;
          } catch { /* fall through */ }
        }
        const order = generateBoardOrder(items);
        setBoardOrder(order);
        setBingoItems(boardFromOrder(items, order));
      }
      setBoardReady(true);
      logEvent({ eventType: 'game_started', sport, isMultiplayer: !!sessionInfo, userId, sessionId: sessionInfo?.sessionId, playerId: sessionInfo?.playerId }, isDev ?? false);
    }
    init();
  }, [sport, sessionInfo]);

  // Guest: poll + subscribe for shared terms confirmation and host-ended status
  useEffect(() => {
    if (!sessionInfo || imHost) return;
    const items = getBingoItems(sport);

    const checkSession = async () => {
      const session = await getSessionById(sessionInfo.sessionId).catch(() => null);
      if (!session) return;

      if (waitingForHost && session.shared_terms?.length === 24) {
        const order = generateBoardFromTermIndices(session.shared_terms);
        setBoardOrder(order);
        setBingoItems(boardFromOrder(items, order));
        await savePlayerBoard(sessionInfo.playerId, order, [12]).catch(() => {});
        setWaitingForHost(false);
        logEvent({ eventType: 'game_started', sport, isMultiplayer: true, userId, sessionId: sessionInfo.sessionId, playerId: sessionInfo.playerId }, isDev ?? false);
      }

      if (session.status === 'host_ended' && !hostEndedShownRef.current) {
        hostEndedShownRef.current = true;
        setShowHostEndedPopup(true);
        if (expiresAt) {
          const ms = expiresAt.getTime() - Date.now();
          const hours = Math.floor(ms / (1000 * 60 * 60));
          const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
          setSessionTimeLeft(hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`);
        }
      }
    };

    const channel = subscribeToSessionUpdate(sessionInfo.sessionId, () => { checkSession(); }, '-guest');
    const poll = setInterval(checkSession, 4000);
    checkSession();

    return () => {
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, [sessionInfo, imHost, sport, waitingForHost, expiresAt]);

  // Fetch session expiry + initial player list
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

  // Keep current player's squares current in the leaderboard list
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

  // Realtime: other players' progress
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

    const fetch = () =>
      getSessionPlayers(sessionInfo.sessionId)
        .then(players => { if (players.length > 0) setProgressPlayers(prev => merge(prev, players)); })
        .catch(() => {});

    const t1 = setTimeout(fetch, 1500);
    const t2 = setTimeout(fetch, 4000);
    const poll = setInterval(fetch, 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, [sessionInfo]);

  // Timer: 30-min warning + expiry check
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

  // Win detection
  useEffect(() => {
    if (isMultiplayer) {
      if (isBlackoutMode) {
        if (markedSquares.size < 25 || hasBingo) return;
      } else {
        if (!checkBingo(markedSquares) || hasBingo) return;
      }
      setHasBingo(true);
      setExpandedSquare(null);
      setShowWinPopup(true);
      logEvent({ eventType: 'bingo_achieved', sport, isMultiplayer: true, userId, sessionId: sessionInfo?.sessionId, playerId: sessionInfo?.playerId }, isDev ?? false);
    } else {
      if (blackoutMode) {
        if (markedSquares.size < 25 || hasBlackout) return;
        setHasBlackout(true);
        setExpandedSquare(null);
        setShowBlackoutWin(true);
        logEvent({ eventType: 'bingo_achieved', sport, isMultiplayer: false, userId }, isDev ?? false);
      } else {
        if (!checkBingo(markedSquares) || hasBingo) return;
        setHasBingo(true);
        setExpandedSquare(null);
        logEvent({ eventType: 'bingo_achieved', sport, isMultiplayer: false, userId }, isDev ?? false);
        setShowBingoMessage(true);
        setShowBlackoutChoice(true);
        setTimeout(() => setShowBingoMessage(false), 3000);
      }
    }
  }, [markedSquares]);

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
    if (imHost && useSharedTerms && !termsConfirmed) {
      if (shufflesRemaining <= 0) return;
      setShufflesRemaining(r => r - 1);
    }
    logEvent({ eventType: 'board_shuffled', sport, isMultiplayer: !!sessionInfo, hadBingo: hasBingo, userId, sessionId: sessionInfo?.sessionId, playerId: sessionInfo?.playerId }, isDev ?? false);
    const items = getBingoItems(sport);
    const order = generateBoardOrder(items);
    setBoardOrder(order);
    setBingoItems(boardFromOrder(items, order));
    setMarkedSquares(new Set([12]));
    setExpandedSquare(null);
    setHasBingo(false);
    setShowBingoMessage(false);
    setShowBlackoutChoice(false);
    setBlackoutMode(false);
    setHasBlackout(false);
    setShowBlackoutWin(false);
    setShowWinPopup(false);
    if (sessionInfo) {
      savePlayerBoard(sessionInfo.playerId, order, [12]).catch(() => {});
    }
  };

  const handleConfirmTerms = async () => {
    if (!sessionInfo) return;
    const termIndices = boardOrder.filter(i => i !== -1);
    try {
      await confirmSharedTerms(sessionInfo.sessionId, termIndices);
      setTermsConfirmed(true);
    } catch { /* share button stays locked */ }
  };

  const handleEndGame = async () => {
    if (sessionInfo && imHost) {
      await endSession(sessionInfo.sessionId).catch(() => {});
    }
    logEvent({ eventType: 'game_exited', sport, isMultiplayer: !!sessionInfo, hadBingo: hasBingo, userId, sessionId: sessionInfo?.sessionId, playerId: sessionInfo?.playerId }, isDev ?? false);
    onGameEnd();
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

  if (!boardReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-400">Loading board…</p>
      </div>
    );
  }

  if (waitingForHost) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-xs">
          <p className="text-neutral-300 mb-3" style={{ fontSize: '17px' }}>Waiting for host to set the board…</p>
          <p className="text-neutral-500" style={{ fontSize: '13px' }}>The host is selecting their terms. You'll be connected automatically.</p>
        </div>
      </div>
    );
  }

  const expandedItem = expandedSquare !== null ? bingoItems[expandedSquare] : null;
  const guestCanNewBoard = !isMultiplayer || imHost || !useSharedTerms;

  return (
    <div className="min-h-screen p-4 flex flex-col">
      <Confetti trigger={hasBingo || hasBlackout} />

      {/* 30-min warning */}
      <AnimatePresence>
        {show30MinWarning && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="fixed top-14 inset-x-4 z-50 max-w-md mx-auto bg-green-500 text-zinc-900 rounded px-4 py-2 text-center text-sm font-medium shadow-lg"
          >
            30 minutes until this board expires
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expired popup */}
      <AnimatePresence>
        {showExpiredPopup && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 backdrop-blur-sm z-50" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 25 }} className="w-full max-w-xs bg-zinc-800 border-2 border-zinc-600 rounded-lg p-6 text-center">
                <h3 className="text-neutral-200 uppercase tracking-wider mb-3">Your Game Has Expired</h3>
                <p className="text-neutral-400 mb-6">Would you like to go back to the lobby?</p>
                <div className="flex gap-3">
                  <Button onClick={() => setShowExpiredPopup(false)} variant="outline" className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 h-10">Stay</Button>
                  <Button onClick={handleEndGame} className="flex-1 text-zinc-900 h-10" style={{ background: `linear-gradient(to right, ${GREEN}, ${GREEN_DARK})` }}>Go to Lobby</Button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Restart confirmation */}
      <AnimatePresence>
        {showRestartConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 backdrop-blur-sm z-50" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 25 }} className="w-full max-w-xs bg-zinc-800 border-2 border-zinc-600 rounded-lg p-6 text-center">
                <h3 className="text-neutral-200 uppercase tracking-wider mb-3">New Board</h3>
                <p className="text-neutral-400 mb-6">This will clear your progress and start a new board.</p>
                <div className="flex gap-3">
                  <Button onClick={() => setShowRestartConfirm(false)} variant="outline" className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 h-10">Cancel</Button>
                  <Button onClick={() => { handleRestart(); setShowRestartConfirm(false); }} className="flex-1 text-zinc-900 h-10" style={{ background: `linear-gradient(to right, ${GREEN}, ${GREEN_DARK})` }}>Yes</Button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Multiplayer win banner */}
      {showWinPopup && (
        <div className="fixed inset-x-0 z-50 flex justify-center" style={{ top: '22%', pointerEvents: 'none' }}>
          <motion.div
            style={{ pointerEvents: 'auto' }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            {isBlackoutMode ? (
              <div className="bg-zinc-950 px-6 py-4 rounded shadow-2xl border-2 border-green-500">
                <div className="flex items-center gap-3 mb-3">
                  <Trophy className="w-10 h-10 text-green-500" />
                  <div>
                    <h2 className="mb-0.5 uppercase tracking-wider" style={{ color: GREEN }}>BLACKOUT!</h2>
                    <p style={{ color: '#4ade80' }}>You marked every square!</p>
                  </div>
                  <Trophy className="w-10 h-10 text-green-500" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setShowWinPopup(false)} variant="outline" className="flex-1 h-9" style={{ borderColor: GREEN, color: GREEN, fontSize: '13px' }}>Stay here</Button>
                  <Button onClick={handleEndGame} className="flex-1 h-9 text-zinc-900" style={{ background: `linear-gradient(to right, ${GREEN}, ${GREEN_DARK})`, fontSize: '13px' }}>Go to Lobby</Button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-zinc-900 px-6 py-4 rounded shadow-2xl border-2 border-zinc-800">
                <div className="flex items-center gap-3 mb-3">
                  <Trophy className="w-10 h-10" />
                  <div>
                    <h2 className="mb-0.5 uppercase tracking-wider">BINGO!</h2>
                    <p>You got five in a row!</p>
                  </div>
                  <Trophy className="w-10 h-10" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setShowWinPopup(false)} className="flex-1 h-9 bg-zinc-900 hover:bg-zinc-800 text-neutral-200" style={{ fontSize: '13px' }}>Stay here</Button>
                  <Button onClick={handleEndGame} className="flex-1 h-9 bg-zinc-900 text-neutral-200 hover:bg-zinc-800" style={{ fontSize: '13px' }}>Go to Lobby</Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Host ended popup (guest only) — centered modal, needs user action */}
      <AnimatePresence>
        {showHostEndedPopup && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 backdrop-blur-sm z-50" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 25 }} className="w-full max-w-xs bg-zinc-800 border-2 border-zinc-600 rounded-lg p-6 text-center">
                <h3 className="text-neutral-200 uppercase tracking-wider mb-3">Host Has Left</h3>
                <p className="text-neutral-400 mb-1">The host ended the game.</p>
                {sessionTimeLeft && (
                  <p className="text-neutral-500 mb-5" style={{ fontSize: '13px' }}>Your board is still active for {sessionTimeLeft}.</p>
                )}
                {!sessionTimeLeft && <div className="mb-5" />}
                <div className="flex gap-3">
                  <Button onClick={() => setShowHostEndedPopup(false)} variant="outline" className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 h-10">Keep Playing</Button>
                  <Button onClick={onGameEnd} className="flex-1 text-zinc-900 h-10" style={{ background: `linear-gradient(to right, ${GREEN}, ${GREEN_DARK})` }}>Go to Lobby</Button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Solo BLACKOUT! win banner */}
      {showBlackoutWin && (
        <div className="fixed inset-x-0 z-50 flex justify-center" style={{ top: '22%', pointerEvents: 'none' }}>
          <motion.div
            style={{ pointerEvents: 'auto' }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            <div className="bg-zinc-950 px-6 py-4 rounded shadow-2xl border-2 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="w-10 h-10 text-green-500" />
                <div>
                  <h2 className="mb-0.5 uppercase tracking-wider" style={{ color: GREEN }}>BLACKOUT!</h2>
                  <p style={{ color: '#4ade80' }}>You got all the squares!</p>
                </div>
                <Trophy className="w-10 h-10 text-green-500" />
              </div>
              <div className="flex gap-3 mt-1">
                <Button onClick={() => { setShowBlackoutWin(false); handleRestart(); }} variant="outline" className="flex-1 h-10" style={{ borderColor: GREEN, color: GREEN }}>New Board</Button>
                <Button onClick={() => { setShowBlackoutWin(false); onGameEnd(); }} className="flex-1 text-zinc-900 h-10" style={{ background: `linear-gradient(to right, ${GREEN}, ${GREEN_DARK})` }}>Go to Lobby</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Solo blackout choice popup — behind BINGO banner (z-40) */}
      {showBlackoutChoice && !showBingoMessage && (
        <div className="fixed inset-x-0 z-40 flex justify-center px-4" style={{ top: '25%', pointerEvents: 'none' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 25 }}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="bg-zinc-800 border-2 border-green-500 rounded-lg p-5 text-center shadow-2xl">
              <p className="text-neutral-300 mb-4" style={{ fontSize: '15px' }}>Keep going?</p>
              <div className="flex gap-3">
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => { setBlackoutMode(true); setShowBlackoutChoice(false); }}
                    className="text-zinc-900 h-10"
                    style={{ background: `linear-gradient(to right, ${GREEN}, ${GREEN_DARK})`, fontSize: '13px' }}
                  >
                    Keep Going
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowBlackoutInfo(true)}
                    className="text-neutral-500 hover:text-green-500 transition-colors flex-shrink-0 ml-1"
                    aria-label="Blackout Bingo info"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  onClick={() => { setShowBlackoutChoice(false); setShowRestartConfirm(true); }}
                  variant="outline"
                  className="border-zinc-600 text-neutral-300 hover:bg-zinc-700 h-10"
                  style={{ fontSize: '13px' }}
                >
                  New Board
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Solo BINGO! banner */}
      {showBingoMessage && (
        <div className="fixed inset-x-0 z-50 flex justify-center" style={{ top: '25%', pointerEvents: 'none' }}>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.6 }}
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
        </div>
      )}

      <BBBoardHeader
        sport={sport}
        isMultiplayer={isMultiplayer}
        imHost={imHost}
        sessionInfo={sessionInfo}
        username={username}
        hasBingo={hasBingo}
        copied={copied}
        useSharedTerms={useSharedTerms}
        termsConfirmed={termsConfirmed}
        shufflesRemaining={shufflesRemaining}
        onConfirmTerms={handleConfirmTerms}
        hideNewBoard={!guestCanNewBoard}
        onShuffleInfo={() => setShowShuffleInfo(true)}
        onShareInfo={() => setShowShareInfo(true)}
        onBackToSports={() => {
          logEvent({ eventType: 'game_exited', sport, isMultiplayer: !!sessionInfo, hadBingo: hasBingo, userId, sessionId: sessionInfo?.sessionId, playerId: sessionInfo?.playerId }, isDev ?? false);
          onBackToSports();
        }}
        onGameEnd={handleEndGame}
        onShowBackInfo={() => setShowBackInfo(true)}
        onShare={handleShare}
        onRestart={() => {
          if (imHost && useSharedTerms && !termsConfirmed && shufflesRemaining <= 0) return;
          setShowRestartConfirm(true);
        }}
      />

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
                if (!markedSquares.has(index)) handleConfirmMark(index);
                setExpandedSquare(index);
              }}
              onDoubleClick={index !== 12 ? () => {
                if (markedSquares.has(index)) handleConfirmUnmark(index);
                setExpandedSquare(index);
              } : undefined}
            />
          ))}
        </motion.div>

        {isMultiplayer && progressPlayers.length > 0 && sessionInfo && (
          <Leaderboard
            players={progressPlayers}
            myId={sessionInfo.playerId}
            myMarkedSquares={markedSquares}
            gameMode={gameMode}
          />
        )}
      </div>

      <BBBackInfoSheet
        isOpen={showBackInfo}
        isMultiplayer={isMultiplayer}
        onClose={() => setShowBackInfo(false)}
      />

      <BBExpandedSquareSheet
        item={expandedItem}
        isMarked={expandedSquare !== null && markedSquares.has(expandedSquare)}
        doubleClickMode={true}
        onClose={() => setExpandedSquare(null)}
        onMark={() => expandedSquare !== null && handleConfirmMark(expandedSquare)}
        onUnmark={() => expandedSquare !== null && handleConfirmUnmark(expandedSquare)}
      />

      {/* Blackout bingo info sheet */}
      <AnimatePresence>
        {showBlackoutInfo && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBlackoutInfo(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-x-0 bottom-0 z-50 bg-zinc-800 rounded-t-lg p-5" style={{ borderTop: `4px solid ${GREEN}` }}>
              <div className="max-w-md mx-auto text-center">
                <h3 className="text-neutral-200 uppercase tracking-wide mb-3">Blackout Bingo</h3>
                <p className="text-neutral-400 mb-6">Mark every square on your board to win. Your progress so far is saved.</p>
                <Button onClick={() => setShowBlackoutInfo(false)} className="w-full text-zinc-900 h-10" style={{ background: `linear-gradient(to right, ${GREEN}, ${GREEN_DARK})` }}>Got it</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Shuffle info sheet */}
      <AnimatePresence>
        {showShuffleInfo && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowShuffleInfo(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-x-0 bottom-0 z-50 bg-zinc-800 rounded-t-lg p-5" style={{ borderTop: `4px solid ${GREEN}` }}>
              <div className="max-w-md mx-auto text-center">
                <h3 className="text-neutral-200 uppercase tracking-wide mb-3">Board Shuffles</h3>
                <p className="text-neutral-400 mb-6">You have {shufflesRemaining} shuffle{shufflesRemaining !== 1 ? 's' : ''} remaining. Once you confirm terms, all guests receive the same 24 terms in a different arrangement.</p>
                <Button onClick={() => setShowShuffleInfo(false)} className="w-full text-zinc-900 h-10" style={{ background: `linear-gradient(to right, ${GREEN}, ${GREEN_DARK})` }}>Got it</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Share locked info sheet */}
      <AnimatePresence>
        {showShareInfo && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowShareInfo(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-x-0 bottom-0 z-50 bg-zinc-800 rounded-t-lg p-5" style={{ borderTop: `4px solid ${GREEN}` }}>
              <div className="max-w-md mx-auto text-center">
                <h3 className="text-neutral-200 uppercase tracking-wide mb-3">Share Locked</h3>
                <p className="text-neutral-400 mb-6">Confirm your board terms before sharing with guests. Click "Confirm Terms" when you're happy with your board.</p>
                <Button onClick={() => setShowShareInfo(false)} className="w-full text-zinc-900 h-10" style={{ background: `linear-gradient(to right, ${GREEN}, ${GREEN_DARK})` }}>Got it</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
