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

// Shuffle just the positions of a fixed set of 24 term indices
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

function WinOrExpirePopup({
  title,
  message,
  onYes,
  onNo,
  borderColor = 'border-green-500',
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
        className="fixed inset-0 backdrop-blur-sm z-50" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
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
          className={`w-full max-w-xs bg-zinc-800 border-2 ${borderColor} rounded-lg p-6 text-center`}
        >
          {icon && <div className="flex justify-center mb-3">{icon}</div>}
          <h3 className="text-neutral-200 uppercase tracking-wider mb-3">{title}</h3>
          <p className="text-neutral-400 mb-6">{message}</p>
          <div className="flex gap-3">
            <Button onClick={onNo} variant="outline" className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 h-10">No</Button>
            <Button onClick={onYes} className="flex-1 text-zinc-900 h-10" style={{ background: `linear-gradient(to right, ${GREEN}, ${GREEN_DARK})` }}>Yes</Button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

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
  const doubleClickEnabled = true;

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
  const [showMultiplayerWin, setShowMultiplayerWin] = useState(false);

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

  // Keep allHaveBingoRef current
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
        // Try loading saved board first (handles reconnect for all cases)
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
            // Check if terms are already confirmed (reconnect)
            if (imHost && useSharedTerms) {
              const session = await getSessionById(sessionInfo.sessionId).catch(() => null);
              if (session?.shared_terms?.length) setTermsConfirmed(true);
            }
            setBoardReady(true);
            return;
          }
        } catch { /* fall through */ }

        // Guest waiting for shared terms
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
          // Host or non-shared-terms: generate fresh board
          const order = generateBoardOrder(items);
          setBoardOrder(order);
          setBingoItems(boardFromOrder(items, order));
          await savePlayerBoard(sessionInfo.playerId, order, [12]).catch(() => {});
        }
      } else {
        // Solo
        const order = generateBoardOrder(items);
        setBoardOrder(order);
        setBingoItems(boardFromOrder(items, order));
      }
      setBoardReady(true);
      logEvent({ eventType: 'game_started', sport, isMultiplayer: !!sessionInfo, userId, sessionId: sessionInfo?.sessionId, playerId: sessionInfo?.playerId }, isDev ?? false);
    }
    init();
  }, [sport, sessionInfo]);

  // Guest: subscribe to session updates while waiting for host to confirm terms
  useEffect(() => {
    if (!waitingForHost || !sessionInfo || imHost) return;
    const items = getBingoItems(sport);

    const checkTerms = async () => {
      const session = await getSessionById(sessionInfo.sessionId).catch(() => null);
      if (session?.shared_terms?.length === 24) {
        const order = generateBoardFromTermIndices(session.shared_terms);
        setBoardOrder(order);
        setBingoItems(boardFromOrder(items, order));
        await savePlayerBoard(sessionInfo.playerId, order, [12]).catch(() => {});
        setWaitingForHost(false);
        logEvent({ eventType: 'game_started', sport, isMultiplayer: true, userId, sessionId: sessionInfo.sessionId, playerId: sessionInfo.playerId }, isDev ?? false);
      }
    };

    const channel = subscribeToSessionUpdate(sessionInfo.sessionId, (updated) => {
      if (updated.shared_terms?.length === 24) checkTerms();
    });

    const poll = setInterval(checkTerms, 4000);
    checkTerms();

    return () => {
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, [waitingForHost, sessionInfo, imHost, sport]);

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

  // Win detection
  useEffect(() => {
    if (isMultiplayer) {
      // Multiplayer blackout: all 25 marked
      if (isBlackoutMode) {
        if (markedSquares.size < 25 || hasBingo) return;
        setHasBingo(true);
        logEvent({ eventType: 'bingo_achieved', sport, isMultiplayer: true, userId, sessionId: sessionInfo?.sessionId, playerId: sessionInfo?.playerId }, isDev ?? false);
      } else {
        if (!checkBingo(markedSquares) || hasBingo) return;
        setHasBingo(true);
        logEvent({ eventType: 'bingo_achieved', sport, isMultiplayer: true, userId, sessionId: sessionInfo?.sessionId, playerId: sessionInfo?.playerId }, isDev ?? false);
      }
    } else {
      // Solo: blackout mode
      if (blackoutMode) {
        if (markedSquares.size < 25 || hasBlackout) return;
        setHasBlackout(true);
        setShowBlackoutWin(true);
        logEvent({ eventType: 'bingo_achieved', sport, isMultiplayer: false, userId }, isDev ?? false);
      } else {
        // Solo: regular bingo — show banner then choice popup
        if (!checkBingo(markedSquares) || hasBingo) return;
        setHasBingo(true);
        logEvent({ eventType: 'bingo_achieved', sport, isMultiplayer: false, userId }, isDev ?? false);
        setShowBingoMessage(true);
        setShowBlackoutChoice(true); // mount behind bingo banner
        setTimeout(() => setShowBingoMessage(false), 3000); // banner exits, choice revealed
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
    setShowMultiplayerWin(false);
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
    } catch {
      // ignore — share button will stay locked
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

  const handleExitToSports = () => {
    logEvent({ eventType: 'game_exited', sport, isMultiplayer: !!sessionInfo, hadBingo: hasBingo, userId, sessionId: sessionInfo?.sessionId, playerId: sessionInfo?.playerId }, isDev ?? false);
    onBackToSports();
  };

  const handleExitGame = () => {
    logEvent({ eventType: 'game_exited', sport, isMultiplayer: !!sessionInfo, hadBingo: hasBingo, userId, sessionId: sessionInfo?.sessionId, playerId: sessionInfo?.playerId }, isDev ?? false);
    onGameEnd();
  };

  return (
    <div className="min-h-screen p-4 flex flex-col">
      <Confetti trigger={hasBingo || hasBlackout} />

      {/* 30-min warning banner */}
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
          <WinOrExpirePopup
            title="Your Game Has Expired"
            message="Would you like to start a new game?"
            onYes={onGameEnd}
            onNo={() => setShowExpiredPopup(false)}
            borderColor="border-zinc-600"
          />
        )}
      </AnimatePresence>

      {/* Multiplayer win popup */}
      <AnimatePresence>
        {showMultiplayerWin && (
          <WinOrExpirePopup
            title="Congratulations!"
            message="Would you like to start a new game?"
            onYes={onGameEnd}
            onNo={() => setShowMultiplayerWin(false)}
            borderColor="border-green-500"
            icon={<Trophy className="w-10 h-10 text-green-500" />}
          />
        )}
      </AnimatePresence>

      {/* Restart confirmation */}
      <AnimatePresence>
        {showRestartConfirm && (
          <WinOrExpirePopup
            title="Get a New Board"
            message="This will clear your progress and start a new board."
            onYes={() => { handleRestart(); setShowRestartConfirm(false); }}
            onNo={() => setShowRestartConfirm(false)}
            borderColor="border-zinc-600"
          />
        )}
      </AnimatePresence>

      {/* Solo blackout win popup */}
      <AnimatePresence>
        {showBlackoutWin && (
          <WinOrExpirePopup
            title="BLACKOUT!"
            message="You marked every square. Get a new board?"
            onYes={() => { setShowBlackoutWin(false); handleRestart(); }}
            onNo={() => setShowBlackoutWin(false)}
            borderColor="border-green-500"
            icon={<Trophy className="w-10 h-10 text-green-500" />}
          />
        )}
      </AnimatePresence>

      {/* Solo blackout choice popup — sits behind the bingo banner (z-40 vs z-50) */}
      <AnimatePresence>
        {showBlackoutChoice && !showBingoMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed top-1/4 left-1/2 -translate-x-1/2 z-40 w-full px-4"
            style={{ maxWidth: '320px' }}
          >
            <div className="bg-zinc-800 border-2 border-green-500 rounded-lg p-5 text-center shadow-2xl">
              <p className="text-neutral-300 mb-4" style={{ fontSize: '15px' }}>Keep going?</p>
              <div className="flex gap-3">
                <div className="flex items-center gap-1 flex-1">
                  <Button
                    onClick={() => { setBlackoutMode(true); setShowBlackoutChoice(false); }}
                    className="flex-1 text-zinc-900 h-10"
                    style={{ background: `linear-gradient(to right, ${GREEN}, ${GREEN_DARK})`, fontSize: '13px' }}
                  >
                    Keep Going
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowBlackoutInfo(true)}
                    className="text-neutral-500 hover:text-green-500 transition-colors flex-shrink-0"
                    aria-label="Blackout Bingo info"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  onClick={() => { setShowBlackoutChoice(false); setShowRestartConfirm(true); }}
                  variant="outline"
                  className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 h-10"
                  style={{ fontSize: '13px' }}
                >
                  New Board
                </Button>
              </div>
            </div>
          </motion.div>
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

      <BBBoardHeader
        sport={sport}
        isMultiplayer={isMultiplayer}
        imHost={imHost}
        sessionInfo={sessionInfo}
        username={username}
        hasBingo={hasBingo}
        showMultiplayerWin={showMultiplayerWin}
        copied={copied}
        useSharedTerms={useSharedTerms}
        termsConfirmed={termsConfirmed}
        shufflesRemaining={shufflesRemaining}
        onConfirmTerms={handleConfirmTerms}
        onShuffleInfo={() => setShowShuffleInfo(true)}
        onShareInfo={() => setShowShareInfo(true)}
        onBackToSports={handleExitToSports}
        onGameEnd={handleExitGame}
        onShowBackInfo={() => setShowBackInfo(true)}
        onShare={handleShare}
        onRestart={() => {
          if (imHost && useSharedTerms && !termsConfirmed && shufflesRemaining <= 0) return;
          setShowRestartConfirm(true);
        }}
      />

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
        doubleClickMode={doubleClickEnabled}
        onClose={() => setExpandedSquare(null)}
        onMark={() => expandedSquare !== null && handleConfirmMark(expandedSquare)}
        onUnmark={() => expandedSquare !== null && handleConfirmUnmark(expandedSquare)}
      />

      {/* Blackout bingo info sheet */}
      <AnimatePresence>
        {showBlackoutInfo && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowBlackoutInfo(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-zinc-800 rounded-t-lg p-5"
              style={{ borderTop: `4px solid ${GREEN}` }}
            >
              <div className="max-w-md mx-auto text-center">
                <h3 className="text-neutral-200 uppercase tracking-wide mb-3">Blackout Bingo</h3>
                <p className="text-neutral-400 mb-6">Mark every square on your board to win. Your progress so far is saved.</p>
                <Button onClick={() => setShowBlackoutInfo(false)} className="w-full text-zinc-900 h-10" style={{ background: `linear-gradient(to right, ${GREEN}, ${GREEN_DARK})` }}>Got it</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Shuffle info sheet (host, shared terms) */}
      <AnimatePresence>
        {showShuffleInfo && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowShuffleInfo(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-zinc-800 rounded-t-lg p-5"
              style={{ borderTop: `4px solid ${GREEN}` }}
            >
              <div className="max-w-md mx-auto text-center">
                <h3 className="text-neutral-200 uppercase tracking-wide mb-3">Board Shuffles</h3>
                <p className="text-neutral-400 mb-6">You have {shufflesRemaining} shuffle{shufflesRemaining !== 1 ? 's' : ''} remaining. Once you click Confirm Terms, all guests will receive the same 24 terms on their boards in a different arrangement.</p>
                <Button onClick={() => setShowShuffleInfo(false)} className="w-full text-zinc-900 h-10" style={{ background: `linear-gradient(to right, ${GREEN}, ${GREEN_DARK})` }}>Got it</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Share locked info sheet (host, shared terms, not yet confirmed) */}
      <AnimatePresence>
        {showShareInfo && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowShareInfo(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-zinc-800 rounded-t-lg p-5"
              style={{ borderTop: `4px solid ${GREEN}` }}
            >
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
