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
  const [username, setUsername] = useState(defaultUsername ?? '');
  const [joinCode] = useState(generateJoinCode);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const isValid = groupName.trim().length > 0 && username.trim().length >= 2;
  const shareLink = `${window.location.origin}?join=${joinCode}`;
  const shareMessage = `${username.trim() || '...'} has invited you to ${groupName.trim() || '...'} Bingo. Your code is ${joinCode}. Sign in at: ${shareLink}`;

  const handleUsernameChange = (val: string) => {
    const trimmed = val.slice(0, 18);
    if (!trimmed) { setUsername(''); return; }
    setUsername(trimmed[0].toUpperCase() + trimmed.slice(1).toLowerCase());
  };

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
      await onContinue(groupName.trim(), username.trim(), joinCode);
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
        {/* Back button row */}
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

        {/* Centered title */}
        <h2 className="text-green-500 uppercase tracking-wider text-center mb-8">
          Host Setup
        </h2>

        <div className="flex flex-col gap-5 items-center">

          {/* Team Name */}
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
              className="w-full bg-zinc-800 border-2 border-zinc-600 focus:border-green-500 rounded px-4 py-2 text-lg text-neutral-200 text-center outline-none transition-colors"
            />
          </div>

          {/* Username */}
          <div className="w-full mb-3">
            <label className="text-neutral-400 uppercase tracking-wider mb-1 block text-center" style={{ fontSize: '14px' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="e.g. Jordan"
              maxLength={18}
              className="w-full bg-zinc-800 border-2 border-zinc-600 focus:border-green-500 rounded px-4 py-2 text-lg text-neutral-200 text-center outline-none transition-colors"
            />
            {username.length > 0 && username.length < 2 && (
              <p className="text-red-400 text-xs text-center mt-1">Minimum 2 characters</p>
            )}
          </div>

          {/* Join code + Share — only visible once valid */}
          <AnimatePresence>
            {isValid && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="w-full flex flex-col gap-2"
              >
                <div className="bg-zinc-800 border-2 border-zinc-700 rounded p-3 text-center">
                  <p className="text-neutral-200 text-base mb-1">
                    Join Code: <span className="text-green-500 font-mono tracking-widest text-xl">{joinCode}</span>
                  </p>
                  <p className="text-neutral-500" style={{ fontSize: '14px' }}>Share this code with your guests</p>
                </div>
                <Button
                  onClick={handleShare}
                  className="w-full bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-neutral-200 border-2 border-green-500 h-12"
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
                {startError && (
                  <p className="text-red-400 text-sm text-center mb-2">{startError}</p>
                )}
                <Button
                  onClick={handleConfirmStart}
                  disabled={starting}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-zinc-900 h-12 text-lg disabled:opacity-60"
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
