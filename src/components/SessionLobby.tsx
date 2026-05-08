import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Button } from './ui/button';

interface SessionLobbyProps {
  user: SupabaseUser;
  onSolo: (username: string) => void;
  onMultiplayerCreate: (username: string) => void;
  onJoin: (username: string, code: string) => Promise<void>;
  onFaq: () => void;
}

const GREEN = '#17BB34';
const GREEN_DARK = '#14a12d';

const INFO = {
  solo: {
    title: 'Private Game',
    description: 'Play on your own. Mark off terms as they happen during the game and see if you can get bingo.',
  },
  multiplayer: {
    title: 'Multiplayer Game',
    description: 'Play with up to 5 friends. Share a game code and everyone gets the same terms on a different board. First to bingo wins.',
  },
  join: {
    title: 'Join a Game',
    description: 'Enter a 6-character code from a friend who created a game and jump straight into the action.',
  },
};

function titleCase(val: string): string {
  return val
    .split(' ')
    .map(word => word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : '')
    .join(' ');
}

export function SessionLobby({ user: _user, onSolo, onMultiplayerCreate, onJoin, onFaq }: SessionLobbyProps) {
  const [username, setUsername] = useState('');
  const [showUsernameError, setShowUsernameError] = useState(false);
  const [infoPopup, setInfoPopup] = useState<'solo' | 'multiplayer' | 'join' | null>(null);
  const [joinExpanded, setJoinExpanded] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  const handleUsernameChange = (val: string) => {
    const trimmed = val.slice(0, 18);
    setUsername(titleCase(trimmed));
    if (showUsernameError) setShowUsernameError(false);
  };

  const isUsernameValid = username.trim().length >= 2;

  const guardedAction = (action: () => void) => {
    if (!isUsernameValid) {
      setShowUsernameError(true);
      inputRef.current?.focus();
      return;
    }
    action();
  };

  const handleToggleJoin = () => {
    guardedAction(() => {
      const next = !joinExpanded;
      setJoinExpanded(next);
      setJoinCode('');
      setJoinError(null);
      if (next) setTimeout(() => codeRef.current?.focus(), 50);
    });
  };

  const handleJoinSubmit = async () => {
    if (joinCode.length !== 6 || joinLoading) return;
    setJoinLoading(true);
    setJoinError(null);
    try {
      await onJoin(username.trim(), joinCode);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Could not join session.');
      setJoinLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl uppercase tracking-wider mb-1" style={{ color: GREEN }}>Fanatic Bingo</h2>
            <p className="tracking-wider mb-2" style={{ color: GREEN, fontSize: '16px' }}>By Fans, For Fans.</p>
            <div className="h-1 w-20 mx-auto" style={{ backgroundColor: GREEN }} />
          </div>

          {/* Username */}
          <div className="w-full mb-3">
            <label className="text-neutral-400 uppercase tracking-wider mb-1 block text-center" style={{ fontSize: '14px' }}>
              Your Username
            </label>
            <div className="flex items-center gap-2">
              <div className="w-9 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="e.g. Jordan"
                maxLength={18}
                className="flex-1 bg-zinc-800 border-2 border-zinc-600 rounded px-4 py-2 text-lg text-neutral-200 text-center outline-none transition-colors"
                onFocus={e => (e.target.style.borderColor = GREEN)}
                onBlur={e => (e.target.style.borderColor = username.trim().length >= 2 ? GREEN : '')}
              />
              <div className="w-9 shrink-0" />
            </div>
            {showUsernameError && (
              <p className="text-red-400 text-center mt-1" style={{ fontSize: '14px' }}>Please enter a username to continue</p>
            )}
            {!showUsernameError && username.length > 0 && username.trim().length < 2 && (
              <p className="text-red-400 text-xs text-center mt-1">Minimum 2 characters</p>
            )}
          </div>

          <p className="text-neutral-400 text-center mb-3">How do you want to play?</p>

          <div className="flex flex-col gap-3">
            {/* Solo */}
            <div className="flex items-center gap-2">
              <div className="w-9 shrink-0" />
              <div className="flex-1 flex rounded overflow-hidden" style={{ border: `2px solid ${GREEN}` }}>
                <Button
                  onClick={() => guardedAction(() => onSolo(username.trim()))}
                  className="flex-1 bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-neutral-200 text-lg justify-center rounded-none h-12"
                >
                  Private Game
                </Button>
                <button
                  onClick={() => setInfoPopup('solo')}
                  className="flex items-center justify-center px-3 text-neutral-400 hover:text-green-500 hover:bg-zinc-700/50 transition-colors shrink-0"
                  style={{ borderLeft: `2px solid ${GREEN}` }}
                  aria-label="Private Game info"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
              <div className="w-9 shrink-0" />
            </div>

            {/* Multiplayer */}
            <div className="flex items-center gap-2">
              <div className="w-9 shrink-0" />
              <div className="flex-1 flex rounded overflow-hidden" style={{ border: `2px solid ${GREEN}` }}>
                <Button
                  onClick={() => guardedAction(() => onMultiplayerCreate(username.trim()))}
                  className="flex-1 bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-neutral-200 text-lg justify-center rounded-none h-12"
                >
                  Multiplayer Game
                </Button>
                <button
                  onClick={() => setInfoPopup('multiplayer')}
                  className="flex items-center justify-center px-3 text-neutral-400 hover:text-green-500 hover:bg-zinc-700/50 transition-colors shrink-0"
                  style={{ borderLeft: `2px solid ${GREEN}` }}
                  aria-label="Multiplayer Game info"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
              <div className="w-9 shrink-0" />
            </div>

            {/* Join */}
            <div className="flex items-center gap-2">
              <div className="w-9 shrink-0" />
              <div className="flex-1 flex rounded overflow-hidden" style={{ border: `2px solid ${GREEN}` }}>
                <Button
                  onClick={handleToggleJoin}
                  className="flex-1 bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-neutral-200 text-lg justify-center rounded-none h-12"
                >
                  Join Game
                </Button>
                <button
                  onClick={() => setInfoPopup('join')}
                  className="flex items-center justify-center px-3 text-neutral-400 hover:text-green-500 hover:bg-zinc-700/50 transition-colors shrink-0"
                  style={{ borderLeft: `2px solid ${GREEN}` }}
                  aria-label="Join Game info"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
              <div className="w-9 shrink-0" />
            </div>

            {/* Inline join form */}
            <AnimatePresence>
              {joinExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-9 shrink-0" />
                    <input
                      ref={codeRef}
                      type="text"
                      value={joinCode}
                      onChange={(e) => {
                        setJoinCode(e.target.value.toUpperCase().replace(/[^ABCDEFGHJKLMNPQRSTUVWXYZ23456789]/g, '').slice(0, 6));
                        setJoinError(null);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleJoinSubmit()}
                      placeholder="Game Code"
                      maxLength={6}
                      className="flex-1 bg-zinc-800 border-2 border-zinc-600 rounded px-4 py-2 text-lg text-neutral-200 text-center font-mono tracking-widest outline-none transition-colors"
                      onFocus={e => (e.target.style.borderColor = GREEN)}
                      onBlur={e => (e.target.style.borderColor = joinCode.length === 6 ? GREEN : '')}
                    />
                    <div className="w-9 shrink-0" />
                  </div>
                  {joinError && (
                    <p className="text-red-400 text-center" style={{ fontSize: '14px' }}>{joinError}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-9 shrink-0" />
                    <Button
                      onClick={handleJoinSubmit}
                      disabled={joinCode.length !== 6 || joinLoading}
                      className="flex-1 h-12 text-lg text-zinc-900 disabled:opacity-50"
                      style={{ background: `linear-gradient(to right, ${GREEN}, ${GREEN_DARK})` }}
                    >
                      {joinLoading ? 'Joining...' : 'Continue'}
                    </Button>
                    <div className="w-9 shrink-0" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Footer links */}
      <div className="flex flex-col items-center gap-3 pb-8">
        <button
          onClick={onFaq}
          className="text-neutral-500 hover:text-neutral-300 tracking-wider transition-colors"
          style={{ fontSize: '14px' }}
        >
          FAQs
        </button>
        <a
          href="https://github.com/turquoise-mermaid/Sports-Bingo/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-500 hover:text-neutral-300 uppercase tracking-wider transition-colors"
          style={{ fontSize: '14px' }}
        >
          Submit an Issue
        </a>
      </div>

      {/* Info bottom sheet */}
      <AnimatePresence>
        {infoPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setInfoPopup(null)}
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
                <h3 className="text-neutral-200 uppercase tracking-wide mb-3">
                  {INFO[infoPopup].title}
                </h3>
                <p className="text-neutral-400 mb-6">
                  {INFO[infoPopup].description}
                </p>
                <Button
                  onClick={() => setInfoPopup(null)}
                  className="w-full text-zinc-900 h-10"
                  style={{ background: `linear-gradient(to right, ${GREEN}, ${GREEN_DARK})` }}
                >
                  Ok
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
