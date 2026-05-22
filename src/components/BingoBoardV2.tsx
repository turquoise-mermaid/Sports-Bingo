import { AnimatePresence, motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import { SessionInfo, Sport } from '../App';
import { BingoSquare } from './BingoSquare';
import { Confetti } from './Confetti';
import { Leaderboard } from './Leaderboard';
import { BBBoardHeader } from './BBBoardHeader';
import { BBBackInfoSheet } from './BBBackInfoSheet';
import { BBExpandedSquareSheet } from './BBExpandedSquareSheet';
import { WinOrExpirePopup } from './WinOrExpirePopup';
import { SoloBingoBanner } from './SoloBingoBanner';
import { useBingoGame } from '../hooks/useBingoGame';

interface BingoBoardV2Props {
  sport: Sport;
  sessionInfo: SessionInfo | null;
  username?: string;
  onBackToSports: () => void;
  onGameEnd: () => void;
}

export function BingoBoardV2({ sport, sessionInfo, username, onBackToSports, onGameEnd }: BingoBoardV2Props) {
  const {
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
  } = useBingoGame({ sport, sessionInfo });

  if (!boardReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-400">Loading board…</p>
      </div>
    );
  }

  const expandedItem = expandedSquare !== null ? bingoItems[expandedSquare] : null;

  return (
    <div className="min-h-screen p-4 flex flex-col">
      <Confetti trigger={hasBingo} />

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

      <SoloBingoBanner show={showBingoMessage} />

      <BBBoardHeader
        sport={sport}
        isMultiplayer={isMultiplayer}
        imHost={imHost}
        sessionInfo={sessionInfo}
        username={username}
        hasBingo={hasBingo}
        showMultiplayerWin={showMultiplayerWin}
        copied={copied}
        onBackToSports={onBackToSports}
        onGameEnd={onGameEnd}
        onShowBackInfo={() => setShowBackInfo(true)}
        onShare={handleShare}
        onRestart={handleRestart}
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
              onClick={() => { if (index !== 12) setExpandedSquare(index); }}
            />
          ))}
        </motion.div>

        {isMultiplayer && progressPlayers.length > 0 && sessionInfo && (
          <Leaderboard
            players={progressPlayers}
            myId={sessionInfo.playerId}
            myMarkedSquares={markedSquares}
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
        onClose={() => setExpandedSquare(null)}
        onMark={() => expandedSquare !== null && handleConfirmMark(expandedSquare)}
        onUnmark={() => expandedSquare !== null && handleConfirmUnmark(expandedSquare)}
      />
    </div>
  );
}
