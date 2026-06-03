import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Button } from './ui/button';

interface HostCredentialsProps {
  onBack: () => void;
  onContinue: (groupName: string, initials: string, joinCode: string) => Promise<void>;
  defaultUsername?: string;
}

const JOIN_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateJoinCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += JOIN_CODE_CHARS[Math.floor(Math.random() * JOIN_CODE_CHARS.length)];
  }
  return code;
}

export function HostCredentials({ onBack, onContinue, defaultUsername }: HostCredentialsProps) {
  const [groupName, setGroupName] = useState('');
  const [joinCode] = useState(generateJoinCode);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const isValid = groupName.trim().length > 0;
  const hostName = defaultUsername ?? '';
  const shareLink = `${window.location.origin}?join=${joinCode}`;
  const shareMessage = `${hostName || '...'} has invited you to ${groupName.trim() || '...'} Bingo. Your code is ${joinCode}. Sign in at: ${shareLink}`;

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
      await onContinue(groupName.trim(), hostName, joinCode);
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
                  <p className="text-neutral-400" style={{ fontSize: '14px' }}>Share this code with your guests</p>
                </div>
                <Button
                  onClick={handleShare}
                  className="w-full bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-neutral-200 border-2 border-green-500 h-12"
                  style={{ fontSize: '14px' }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {copied ? 'Copied to Clipboard!' : 'Share Invite'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isValid && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full"
              >
                {startError && (
                  <p className="text-red-400 text-center mb-2" style={{ fontSize: '14px' }}>{startError}</p>
                )}
                <Button
                  onClick={handleConfirmStart}
                  disabled={starting}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-zinc-900 h-10 disabled:opacity-60"
                  style={{ fontSize: '14px' }}
                >
                  {starting ? 'Starting…' : 'Start Game'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
}
