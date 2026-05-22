import { useEffect, useRef, useState } from 'react';
import { SessionInfo, Sport } from '../App';
import { BingoItem, getBingoItems } from '../components/bingoDataNoIcons';
import { boardFromOrder, checkBingo, generateBoardOrder } from '../lib/bingoGame';
import { supabase } from '../lib/supabase';
import {
  getSessionById,
  getSessionPlayers,
  loadPlayerBoard,
  PlayerRow,
  savePlayerBoard,
  subscribeToSessionPlayers,
} from '../lib/sessions';

export function useBingoGame({ sport, sessionInfo }: { sport: Sport; sessionInfo: SessionInfo | null }) {
  const isMultiplayer = !!sessionInfo;
  const imHost = !!sessionInfo?.isHost;

  const [bingoItems, setBingoItems] = useState<(BingoItem | null)[]>([]);
  const [boardOrder, setBoardOrder] = useState<number[]>([]);
  const [markedSquares, setMarkedSquares] = useState<Set<number>>(new Set([12]));
  const [boardReady, setBoardReady] = useState(false);
  const [expandedSquare, setExpandedSquare] = useState<number | null>(null);
  const [hasBingo, setHasBingo] = useState(false);

  const [showBingoMessage, setShowBingoMessage] = useState(false);

  const [progressPlayers, setProgressPlayers] = useState<PlayerRow[]>([]);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [show30MinWarning, setShow30MinWarning] = useState(false);
  const [showExpiredPopup, setShowExpiredPopup] = useState(false);
  const [showMultiplayerWin, setShowMultiplayerWin] = useState(false);

  const [showBackInfo, setShowBackInfo] = useState(false);
  const [copied, setCopied] = useState(false);

  const warned30Ref = useRef(false);
  const allHaveBingoRef = useRef(false);

  useEffect(() => {
    if (!sessionInfo) return;
    allHaveBingoRef.current = progressPlayers.every(p => {
      const marked = p.id === sessionInfo.playerId
        ? [...markedSquares]
        : (p.marked_squares ?? []);
      return checkBingo(new Set(marked));
    });
  }, [progressPlayers, markedSquares, sessionInfo]);

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
        const order = generateBoardOrder(items.length);
        setBoardOrder(order);
        setBingoItems(boardFromOrder(items, order));
        await savePlayerBoard(sessionInfo.playerId, order, [12]).catch(() => {});
      } else {
        const order = generateBoardOrder(items.length);
        setBoardOrder(order);
        setBingoItems(boardFromOrder(items, order));
      }
      setBoardReady(true);
    }
    init();
  }, [sport, sessionInfo]);

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

  useEffect(() => {
    if (!checkBingo(markedSquares) || hasBingo) return;
    setHasBingo(true);
    if (!isMultiplayer) {
      setShowBingoMessage(true);
      setTimeout(() => setShowBingoMessage(false), 3000);
    }
    // setTimeout(() => setShowMultiplayerWin(true), 3000);
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
    const items = getBingoItems(sport);
    const order = generateBoardOrder(items.length);
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

  return {
    isMultiplayer,
    imHost,
    bingoItems,
    markedSquares,
    boardReady,
    expandedSquare,
    setExpandedSquare,
    hasBingo,
    showBingoMessage,
    progressPlayers,
    show30MinWarning,
    showExpiredPopup,
    setShowExpiredPopup,
    showMultiplayerWin,
    setShowMultiplayerWin,
    showBackInfo,
    setShowBackInfo,
    copied,
    handleConfirmMark,
    handleConfirmUnmark,
    handleRestart,
    handleShare,
  };
}
