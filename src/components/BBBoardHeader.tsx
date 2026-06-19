import { ArrowLeft, RotateCcw, Share2, Info, Check } from 'lucide-react';
import { Sport, SessionInfo } from '../App';
import { Button } from './ui/button';

const SPORT_NAMES: Record<Sport, string> = {
  soccer: 'Soccer',
  americanFootball: 'Football',
  baseball: 'Baseball',
  basketball: 'Basketball',
  rugby: 'Rugby',
  hockey: 'Hockey',
};

interface BBBoardHeaderProps {
  sport: Sport;
  isMultiplayer: boolean;
  imHost: boolean;
  sessionInfo: SessionInfo | null;
  username?: string;
  hasBingo: boolean;
  copied: boolean;
  // Shared terms
  useSharedTerms?: boolean;
  termsConfirmed?: boolean;
  shufflesRemaining?: number;
  onConfirmTerms?: () => void;
  onShuffleInfo?: () => void;
  onShareInfo?: () => void;
  hideNewBoard?: boolean;
  // Handlers
  onBackToSports: () => void;
  onGameEnd: () => void;
  onShowBackInfo: () => void;
  onShare: () => void;
  onRestart: () => void;
}

export function BBBoardHeader({
  sport,
  isMultiplayer,
  imHost,
  sessionInfo,
  username,
  hasBingo,
  copied,
  useSharedTerms,
  termsConfirmed,
  shufflesRemaining,
  onConfirmTerms,
  onShuffleInfo,
  onShareInfo,
  hideNewBoard,
  onBackToSports,
  onGameEnd,
  onShowBackInfo,
  onShare,
  onRestart,
}: BBBoardHeaderProps) {
  const shareBlocked = isMultiplayer && imHost && useSharedTerms && !termsConfirmed;
  const newBoardDisabled = isMultiplayer && imHost && useSharedTerms && !termsConfirmed && (shufflesRemaining ?? 0) <= 0;

  return (
    <>
      {/* Header row */}
      <div className="relative flex items-center justify-between mb-1">

        {/* Left: Back + (i) + host actions */}
        <div className="flex flex-col items-start gap-0.5">
          <div className="flex items-center gap-1">
            <Button
              onClick={onBackToSports}
              variant="ghost"
              className="text-neutral-300 hover:bg-zinc-800 hover:text-green-500 h-8 px-3"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            {(!isMultiplayer || imHost) && (
              <button
                onClick={onShowBackInfo}
                className="text-neutral-500 hover:text-green-500 transition-colors"
                aria-label="Back info"
              >
                <Info className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Host: New Board (left side in multiplayer) */}
          {imHost && (
            <div className="flex items-center gap-1">
              <Button
                onClick={newBoardDisabled ? undefined : onRestart}
                variant="ghost"
                className={`h-7 px-3 ${newBoardDisabled ? 'text-zinc-600 cursor-default' : 'text-neutral-300 hover:bg-zinc-800 hover:text-green-500'}`}
                style={{ fontSize: '14px' }}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                New Board
                {useSharedTerms && !termsConfirmed && shufflesRemaining !== undefined && (
                  <span className="ml-1 text-neutral-500" style={{ fontSize: '11px' }}>({shufflesRemaining} left)</span>
                )}
              </Button>
              {useSharedTerms && !termsConfirmed && onShuffleInfo && (
                <button
                  onClick={onShuffleInfo}
                  className="text-neutral-500 hover:text-green-500 transition-colors"
                  aria-label="Shuffle info"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Host: Confirm Terms button */}
          {imHost && useSharedTerms && !termsConfirmed && onConfirmTerms && (
            <Button
              onClick={onConfirmTerms}
              variant="ghost"
              className="text-green-500 hover:bg-zinc-800 hover:text-green-400 h-7 px-3"
              style={{ fontSize: '13px' }}
            >
              <Check className="w-3 h-3 mr-1" />
              Confirm Terms
            </Button>
          )}

        </div>

        {/* Center: sport title */}
        <h2
          className="absolute text-green-500 uppercase tracking-wider text-base text-center whitespace-nowrap pointer-events-none"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        >
          {SPORT_NAMES[sport].toUpperCase()} BINGO
        </h2>

        {/* Right: solo New Board | host Share | guest New Board */}
        {!isMultiplayer && (
          <Button
            onClick={onRestart}
            variant="ghost"
            className="text-neutral-300 hover:bg-zinc-800 hover:text-green-500 h-8 px-3"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            New Board
          </Button>
        )}
        {imHost && (
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              {shareBlocked && onShareInfo && (
                <button
                  onClick={onShareInfo}
                  className="text-neutral-500 hover:text-green-500 transition-colors"
                  aria-label="Share locked info"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              )}
              <Button
                onClick={shareBlocked ? onShareInfo : onShare}
                variant="ghost"
                className={`h-8 px-3 ${shareBlocked ? 'text-zinc-600' : 'text-neutral-300 hover:text-green-500 hover:bg-zinc-800'}`}
              >
                <Share2 className="w-4 h-4 mr-2" />
                <span style={{ fontSize: '14px' }}>{copied ? 'Copied!' : 'Share'}</span>
              </Button>
            </div>
            {sessionInfo?.joinCode && (
              <p className="text-neutral-400 pr-1" style={{ fontSize: '14px' }}>
                Join Code: <span className="text-green-500">{sessionInfo.joinCode}</span>
              </p>
            )}
          </div>
        )}
        {!imHost && isMultiplayer && !hideNewBoard && (
          <Button
            onClick={onRestart}
            variant="ghost"
            className="text-neutral-300 hover:bg-zinc-800 hover:text-green-500 h-8 px-3"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            New Board
          </Button>
        )}
      </div>

      {/* Subtitle row */}
      {isMultiplayer ? (
        <div className="text-center mb-1">
          <p className="text-green-500 uppercase tracking-wider font-bold" style={{ fontSize: '16px' }}>Team {sessionInfo?.groupName}</p>
          <p className="text-neutral-200 mt-0.5" style={{ fontSize: '14px' }}>
            {imHost ? `Host: ${username}` : `${sessionInfo?.initials}'s Board`}
          </p>
        </div>
      ) : (
        <div className="text-center mb-1" style={{ height: '47px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {username && (
            <p className="text-neutral-200" style={{ fontSize: '14px' }}>{username}'s Board</p>
          )}
        </div>
      )}
    </>
  );
}
