import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Info, X } from 'lucide-react';
import { Button } from './ui/button';

interface HostCredentialsProps {
  onBack: () => void;
  onContinue: (groupName: string, initials: string, joinCode: string, gameMode: 'bingo' | 'blackout', useSharedTerms: boolean) => Promise<void>;
  defaultUsername?: string;
  isAnonymous?: boolean;
  onShowLogin?: (mode: 'signin' | 'signup') => void;
}

const GREEN = '#17BB34';
const GREEN_DARK = '#14a12d';

const JOIN_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateJoinCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += JOIN_CODE_CHARS[Math.floor(Math.random() * JOIN_CODE_CHARS.length)];
  }
  return code;
}

type InfoType = 'blackout' | 'sharedTerms' | null;

const INFO_TEXT: Record<NonNullable<InfoType>, { title: string; body: string }> = {
  blackout: {
    title: 'Blackout Bingo',
    body: 'Instead of five in a row, the first player to mark every square on their board wins.',
  },
  sharedTerms: {
    title: 'Shared Terms',
    body: 'All players receive the same 24 terms on their boards, just arranged differently. As host you can preview up to 4 boards before locking in the terms for your guests.',
  },
};

export function HostCredentials({ onBack, onContinue, defaultUsername, isAnonymous, onShowLogin }: HostCredentialsProps) {
  const [groupName, setGroupName] = useState('');
  const [joinCode] = useState(generateJoinCode);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<'bingo' | 'blackout'>('bingo');
  const [useSharedTerms, setUseSharedTerms] = useState(false);
  const [infoOpen, setInfoOpen] = useState<InfoType>(null);
  const [showUpsell, setShowUpsell] = useState(false);

  const isValid = groupName.trim().length > 0;
  const hostName = defaultUsername ?? '';

  const handleConfirmStart = async () => {
    setStarting(true);
    setStartError(null);
    try {
      await onContinue(groupName.trim(), hostName, joinCode, gameMode, useSharedTerms);
    } catch (err) {
      const msg = (err as any)?.message ?? (err instanceof Error ? err.message : null);
      setStartError(msg || 'Could not start game. Please try again.');
      setStarting(false);
    }
  };

  const handleAnonymousTap = () => setShowUpsell(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <div className="mb-2">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-neutral-300 hover:bg-zinc-800 hover:text-green-500 h-8 px-3"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>

        <h2 className="text-green-500 uppercase tracking-wider text-center font-bold mb-6">
          Host Setup
        </h2>

        <div className="flex flex-col gap-4 items-center">

          {/* Team name */}
          <div className="w-full">
            <label className="text-neutral-400 uppercase tracking-wider mb-1 block text-center" style={{ fontSize: '14px' }}>
              Team Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value.slice(0, 25))}
              placeholder="e.g. Sunday Crew"
              maxLength={25}
              className="w-full bg-zinc-800 border-2 border-zinc-600 focus:border-green-500 rounded px-4 py-2 text-neutral-200 text-center outline-none transition-colors"
              style={{ fontSize: '14px' }}
            />
          </div>

          {/* Game mode toggle */}
          <div className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-neutral-300 uppercase tracking-wider" style={{ fontSize: '13px' }}>Game Mode</span>
                <button
                  type="button"
                  onClick={() => setInfoOpen('blackout')}
                  className="text-neutral-500 hover:text-green-500 transition-colors"
                  aria-label="Blackout Bingo info"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div
              className={`flex rounded overflow-hidden border-2 ${isAnonymous ? 'opacity-50' : ''}`}
              style={{ borderColor: GREEN }}
              onClick={isAnonymous ? handleAnonymousTap : undefined}
            >
              <button
                type="button"
                onClick={isAnonymous ? handleAnonymousTap : () => setGameMode('bingo')}
                className="flex-1 py-2 text-center transition-colors"
                style={{
                  fontSize: '13px',
                  backgroundColor: gameMode === 'bingo' ? GREEN : 'transparent',
                  color: gameMode === 'bingo' ? '#18181b' : '#a1a1aa',
                }}
              >
                First to Bingo
              </button>
              <button
                type="button"
                onClick={isAnonymous ? handleAnonymousTap : () => setGameMode('blackout')}
                className="flex-1 py-2 text-center transition-colors"
                style={{
                  fontSize: '13px',
                  borderLeft: `2px solid ${GREEN}`,
                  backgroundColor: gameMode === 'blackout' ? GREEN : 'transparent',
                  color: gameMode === 'blackout' ? '#18181b' : '#a1a1aa',
                }}
              >
                First to Blackout
              </button>
            </div>
          </div>

          {/* Shared terms toggle */}
          <div className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-neutral-300 uppercase tracking-wider" style={{ fontSize: '13px' }}>Shared Terms</span>
                <button
                  type="button"
                  onClick={() => setInfoOpen('sharedTerms')}
                  className="text-neutral-500 hover:text-green-500 transition-colors"
                  aria-label="Shared Terms info"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={isAnonymous ? handleAnonymousTap : () => setUseSharedTerms(v => !v)}
                className={`relative w-12 h-6 rounded-full transition-colors ${isAnonymous ? 'opacity-50' : ''}`}
                style={{ backgroundColor: useSharedTerms && !isAnonymous ? GREEN : '#52525b' }}
                aria-label="Toggle shared terms"
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  style={{ transform: useSharedTerms && !isAnonymous ? 'translateX(24px)' : 'translateX(0)' }}
                />
              </button>
            </div>
            {useSharedTerms && !isAnonymous && (
              <p className="text-neutral-500 mt-2" style={{ fontSize: '12px' }}>
                The share link will be locked until you confirm your board in the game.
              </p>
            )}
          </div>

          {/* Join code + start (only once team name is filled) */}
          <AnimatePresence>
            {isValid && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="w-full flex flex-col gap-4"
              >
                <div className="bg-zinc-800 border-2 border-zinc-700 rounded px-4 py-2 text-center">
                  <p className="text-neutral-200" style={{ fontSize: '14px' }}>
                    Join Code: <span className="text-green-500 font-mono tracking-widest text-base">{joinCode}</span>
                  </p>
                  <p className="text-neutral-400" style={{ fontSize: '14px' }}>
                    {useSharedTerms ? 'Share this code after confirming your board' : 'Share this code with your guests'}
                  </p>
                </div>

                {startError && (
                  <p className="text-red-400 text-center" style={{ fontSize: '14px' }}>{startError}</p>
                )}
                <Button
                  onClick={handleConfirmStart}
                  disabled={starting}
                  className="w-full h-10 disabled:opacity-60 text-zinc-900"
                  style={{ background: `linear-gradient(to right, ${GREEN}, ${GREEN_DARK})`, fontSize: '14px' }}
                >
                  {starting ? 'Starting…' : 'Start Game'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>

      {/* Info bottom sheet */}
      <AnimatePresence>
        {infoOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setInfoOpen(null)}
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
                <h3 className="text-neutral-200 uppercase tracking-wide mb-3">{INFO_TEXT[infoOpen].title}</h3>
                <p className="text-neutral-400 mb-6">{INFO_TEXT[infoOpen].body}</p>
                <Button
                  onClick={() => setInfoOpen(null)}
                  className="w-full text-zinc-900 h-10"
                  style={{ background: `linear-gradient(to right, ${GREEN}, ${GREEN_DARK})` }}
                >
                  Got it
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Anonymous upsell */}
      <AnimatePresence>
        {showUpsell && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowUpsell(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <div className="w-full max-w-xs bg-zinc-800 border-2 border-green-500 rounded-lg p-5 text-center">
                <button
                  type="button"
                  onClick={() => setShowUpsell(false)}
                  className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-300"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-neutral-200 mb-4" style={{ fontSize: '15px' }}>
                  Create a free account to access Blackout mode and Shared Terms.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => { setShowUpsell(false); onShowLogin?.('signup'); }}
                    className="flex-1 text-zinc-900 h-10"
                    style={{ background: `linear-gradient(to right, ${GREEN}, ${GREEN_DARK})` }}
                  >
                    Sign Up
                  </Button>
                  <Button
                    onClick={() => setShowUpsell(false)}
                    variant="outline"
                    className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 h-10"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
