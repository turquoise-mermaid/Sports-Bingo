import { ArrowLeft, RotateCcw, Share2, Info } from 'lucide-react';
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
  showMultiplayerWin: boolean;
  copied: boolean;
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
  showMultiplayerWin,
  copied,
  onBackToSports,
  onGameEnd,
  onShowBackInfo,
  onShare,
  onRestart,
}: BBBoardHeaderProps) {
  return (
    <>
      {/* Header row — Back/action buttons always at the top */}
      <div className="relative flex items-center justify-between mb-1">

        {/* Left: Back + (i) + Restart (host) + Start New Game */}
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
          {imHost && (
            <Button
              onClick={onRestart}
              variant="ghost"
              className="text-neutral-300 hover:bg-zinc-800 hover:text-green-500 h-7 px-3"
              style={{ fontSize: '14px' }}
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Restart
            </Button>
          )}
          {hasBingo && isMultiplayer && !showMultiplayerWin && (
            <Button
              onClick={onGameEnd}
              variant="ghost"
              className="text-green-500 hover:bg-zinc-800 hover:text-green-400 h-7 px-3"
              style={{ fontSize: '14px' }}
            >
              Start New Game
            </Button>
          )}
        </div>

        {/* Center: sport title — absolutely centered */}
        <h2
          className="absolute text-green-500 uppercase tracking-wider text-base text-center whitespace-nowrap pointer-events-none"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        >
          {SPORT_NAMES[sport].toUpperCase()} BINGO
        </h2>

        {/* Right: Restart (solo) | Share + join code (host) | spacer (guest) */}
        {!isMultiplayer && (
          <Button
            onClick={onRestart}
            variant="ghost"
            className="text-neutral-300 hover:bg-zinc-800 hover:text-green-500 h-8 px-3"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Restart
          </Button>
        )}
        {imHost && (
          <div className="flex flex-col items-end gap-1">
            <Button
              onClick={onShare}
              variant="ghost"
              className="text-neutral-300 hover:text-green-500 hover:bg-zinc-800 h-8 px-3"
            >
              <Share2 className="w-4 h-4 mr-2" />
              <span style={{ fontSize: '14px' }}>{copied ? 'Copied!' : 'Share'}</span>
            </Button>
            {sessionInfo?.joinCode && (
              <p className="text-neutral-400 pr-1" style={{ fontSize: '14px' }}>
                Join Code: <span className="text-green-500">{sessionInfo.joinCode}</span>
              </p>
            )}
          </div>
        )}
        {!imHost && isMultiplayer && (
          <Button
            onClick={onRestart}
            variant="ghost"
            className="text-neutral-300 hover:bg-zinc-800 hover:text-green-500 h-8 px-3"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Restart
          </Button>
        )}
      </div>

      {/* Subtitle row — team name + role (multiplayer) | username's Board (solo) */}
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
