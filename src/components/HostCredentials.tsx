import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Button } from './ui/button';

interface HostCredentialsProps {
  onBack: () => void;
  onContinue: (groupName: string, initials: string, hostCode: number, joinCode: number) => Promise<void>;
}

function generateDistinctCodes(): { hostCode: number; joinCode: number } {
  const hostCode = Math.floor(1000 + Math.random() * 9000);
  let joinCode = Math.floor(1000 + Math.random() * 9000);
  while (joinCode === hostCode) joinCode = Math.floor(1000 + Math.random() * 9000);
  return { hostCode, joinCode };
}

export function HostCredentials({ onBack, onContinue }: HostCredentialsProps) {
  const [groupName, setGroupName] = useState('');
  const [initials, setInitials] = useState('');
  const [{ hostCode, joinCode }] = useState(generateDistinctCodes);
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const isValid = groupName.trim().length > 0 && initials.trim().length >= 2;
  const shareLink = `${window.location.origin}?join=${joinCode}`;
  const shareMessage = `${initials.trim() || '...'} has invited you to ${groupName.trim() || '...'} Bingo. Your code is ${joinCode}. Sign in at: ${shareLink}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${groupName.trim()} Bingo`, text: shareMessage });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmStart = async () => {
    setStarting(true);
    setStartError(null);
    try {
      await onContinue(groupName.trim(), initials.trim(), hostCode, joinCode);
    } catch (err) {
      const msg = (err as any)?.message ?? (err instanceof Error ? err.message : null);
      setStartError(msg || 'Could not start game. Please try again.');
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-neutral-300 hover:bg-zinc-800 hover:text-yellow-500 h-8 px-3"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h2 className="text-yellow-500 uppercase tracking-wider mx-auto pr-16">
            Host Setup
          </h2>
        </div>

        <div className="flex flex-col gap-5 items-center">

          {/* Group Name */}
          <div className="w-full">
            <label className="text-neutral-400 text-xs uppercase tracking-wider mb-1 block text-center">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value.slice(0, 25))}
              placeholder="e.g. Sunday Crew"
              maxLength={25}
              className="w-full bg-zinc-800 border-2 border-zinc-600 focus:border-yellow-500 rounded p-3 text-neutral-200 text-center outline-none transition-colors"
            />
          </div>

          {/* Initials */}
          <div className="w-full mb-3">
            <label className="text-neutral-400 text-xs uppercase tracking-wider mb-1 block text-center">
              Your Initials
            </label>
            <input
              type="text"
              value={initials}
              onChange={(e) => setInitials(e.target.value.slice(0, 4).toUpperCase())}
              placeholder="e.g. JS"
              maxLength={4}
              className="w-full bg-zinc-800 border-2 border-zinc-600 focus:border-yellow-500 rounded p-3 text-neutral-200 text-center uppercase outline-none transition-colors tracking-widest text-xl"
            />
            {initials.length > 0 && initials.length < 2 && (
              <p className="text-red-400 text-xs text-center mt-1">Minimum 2 characters</p>
            )}
          </div>

          {/* Host Code + Join Code — only visible once valid */}
          <AnimatePresence>
            {isValid && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="w-full grid grid-cols-2 gap-3 mb-3"
              >
                <div className="bg-zinc-800 border-2 border-zinc-700 rounded p-3 text-center">
                  <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Host Code <span className="normal-case text-neutral-600">— keep private</span></p>
                  <p className="text-yellow-500 text-2xl font-mono tracking-widest">{hostCode}</p>
                </div>
                <div className="bg-zinc-800 border-2 border-zinc-700 rounded p-3 text-center">
                  <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Join Code <span className="normal-case text-neutral-600">— share with guests</span></p>
                  <p className="text-yellow-500 text-2xl font-mono tracking-widest">{joinCode}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sharing Link + Share Button — only visible once valid */}
          <AnimatePresence>
            {isValid && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="w-full flex flex-col gap-2 mt-6"
              >
                <div className="bg-zinc-800 border-2 border-zinc-700 rounded p-3 text-center">
                  <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Sharing Link</p>
                  <p className="text-neutral-400 text-sm font-mono break-all">{shareLink}</p>
                </div>
                <Button
                  onClick={handleShare}
                  className="w-full bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-neutral-200 border-2 border-yellow-500 h-12"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {copied ? 'Copied to Clipboard!' : 'Share Invite'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Continue */}
          <AnimatePresence>
            {isValid && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full"
              >
                <Button
                  onClick={() => setShowTimerWarning(true)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-zinc-900 h-12 text-lg"
                >
                  Continue
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>

      {/* Timer Warning Pop-up */}
      <AnimatePresence>
        {showTimerWarning && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTimerWarning(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-zinc-800 border-2 border-yellow-500 rounded-lg p-6 max-w-md mx-auto text-center"
            >
              <h3 className="text-yellow-500 uppercase tracking-wider mb-3">Ready to Start?</h3>
              <p className="text-neutral-400 mb-6">
                Clicking Start Game will begin the 6-hour timer for all players. Make sure your guests have the join code before continuing.
              </p>
              {startError && (
                <p className="text-red-400 text-sm text-center mb-3">{startError}</p>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowTimerWarning(false)}
                  disabled={starting}
                  variant="outline"
                  className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 h-10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmStart}
                  disabled={starting}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-zinc-900 h-10"
                >
                  {starting ? 'Starting…' : 'Start Game'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
