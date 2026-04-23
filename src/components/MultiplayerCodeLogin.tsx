import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Button } from './ui/button';
import { loginAsHost, rejoinSession } from '../lib/sessions';
import { SessionInfo, Sport } from '../App';

interface MultiplayerCodeLoginProps {
  user: SupabaseUser;
  onBackToLobby: () => void;
  onHostLogin: (sessionInfo: SessionInfo, sport: Sport) => void;
  onPlayerRejoin: (sessionInfo: SessionInfo, sport: Sport) => void;
}

export function MultiplayerCodeLogin({
  user,
  onBackToLobby,
  onHostLogin,
  onPlayerRejoin,
}: MultiplayerCodeLoginProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showHostPopup, setShowHostPopup] = useState(false);
  const [hostCodeInput, setHostCodeInput] = useState('');
  const [hostError, setHostError] = useState<string | null>(null);
  const [showPlayerPopup, setShowPlayerPopup] = useState(false);
  const [playerCodeInput, setPlayerCodeInput] = useState('');
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePlayerCodeSubmit = async () => {
    const code = parseInt(playerCodeInput.trim(), 10);
    if (isNaN(code)) { setPlayerError('Please enter a valid code.'); return; }
    setLoading(true);
    setPlayerError(null);
    try {
      const { session, player } = await rejoinSession(code, user.id);
      onPlayerRejoin(
        {
          sessionId: session.id,
          playerId: player.id,
          groupName: session.group_name,
          initials: player.initials,
          isHost: false,
          joinCode: code,
        },
        session.sport as Sport
      );
    } catch (err) {
      setPlayerError(err instanceof Error ? err.message : 'Could not find your board.');
    } finally {
      setLoading(false);
    }
  };

  const handleHostCodeSubmit = async () => {
    const code = parseInt(hostCodeInput.trim(), 10);
    if (isNaN(code)) {
      setHostError('Please enter a valid code.');
      return;
    }
    setLoading(true);
    setHostError(null);
    try {
      const { session, player } = await loginAsHost(code);
      onHostLogin(
        {
          sessionId: session.id,
          playerId: player.id,
          groupName: session.group_name,
          initials: player.initials,
          isHost: true,
          joinCode: session.join_code,
        },
        session.sport as Sport
      );
    } catch (err) {
      setHostError(err instanceof Error ? err.message : 'Invalid host code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4">

      {/* Header */}
      <div className="flex items-center pt-2 mb-8">
        <div className="flex items-center gap-1">
          <Button
            onClick={() => setShowBackConfirm(true)}
            variant="ghost"
            className="text-neutral-300 hover:bg-zinc-800 hover:text-yellow-500 h-8 px-3"
          >
            ← Back to Start
          </Button>
          <button
            onClick={() => setShowInfo(true)}
            className="text-neutral-500 hover:text-yellow-500 transition-colors p-1"
            aria-label="Warning info"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
        <h2 className="text-yellow-500 uppercase tracking-wider mx-auto pr-16">
          Join Game
        </h2>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md flex flex-col items-center gap-4"
        >
          <div className="w-full flex flex-col gap-3">
            <Button
              onClick={() => { setShowHostPopup(true); setHostError(null); setHostCodeInput(''); }}
              className="w-full bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-neutral-200 border-2 border-yellow-500 h-14 text-lg"
            >
              I'm the Host
            </Button>
            <Button
              onClick={() => { setShowPlayerPopup(true); setPlayerError(null); setPlayerCodeInput(''); }}
              className="w-full bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-neutral-200 border-2 border-yellow-500 h-14 text-lg"
            >
              I'm a Player
            </Button>
          </div>
        </motion.div>
      </div>

      {/* (i) Info sheet */}
      <AnimatePresence>
        {showInfo && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowInfo(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-zinc-800 border-t-4 border-yellow-500 rounded-t-lg p-5"
            >
              <div className="max-w-md mx-auto text-center">
                <h3 className="text-yellow-500 uppercase tracking-wider mb-3">Heads Up</h3>
                <p className="text-neutral-400 mb-6">
                  Tapping "Back to Start" will return you to the lobby and remove you from this session. Your progress will be lost and you will not be able to rejoin without the original invite link.
                </p>
                <Button
                  onClick={() => setShowInfo(false)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-zinc-900 h-10"
                >
                  Got It
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Back to Start confirmation pop-up */}
      <AnimatePresence>
        {showBackConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowBackConfirm(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
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
              className="w-full max-w-md bg-zinc-800 border-2 border-red-500 rounded-lg p-6 text-center"
            >
              <h3 className="text-red-400 uppercase tracking-wider mb-3">Leave Session?</h3>
              <p className="text-neutral-400 mb-6">
                You will be removed from this session and returned to the lobby. This cannot be undone — you will need the original invite link to rejoin.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowBackConfirm(false)}
                  variant="outline"
                  className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 h-10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onBackToLobby}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white h-10"
                >
                  Leave
                </Button>
              </div>
            </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Host code pop-up */}
      <AnimatePresence>
        {showHostPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowHostPopup(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
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
                className="w-full max-w-md bg-zinc-800 border-2 border-yellow-500 rounded-lg p-6 text-center"
              >
                <h3 className="text-yellow-500 uppercase tracking-wider mb-4">Enter Host Code</h3>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={hostCodeInput}
                  onChange={(e) => setHostCodeInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  onKeyDown={(e) => e.key === 'Enter' && handleHostCodeSubmit()}
                  placeholder="• • • •"
                  maxLength={4}
                  autoFocus
                  className="w-full bg-zinc-900 border-2 border-zinc-600 focus:border-yellow-500 rounded p-3 text-neutral-200 text-2xl text-center font-mono tracking-widest outline-none transition-colors mb-2"
                />
                {hostError && <p className="text-red-400 text-sm mt-1 mb-2">{hostError}</p>}
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={() => setShowHostPopup(false)}
                    variant="outline"
                    className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 h-10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleHostCodeSubmit}
                    disabled={loading || hostCodeInput.trim().length < 4}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-zinc-900 h-10 disabled:opacity-50"
                  >
                    {loading ? 'Checking...' : 'Enter'}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Player rejoin pop-up */}
      <AnimatePresence>
        {showPlayerPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPlayerPopup(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
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
                className="w-full max-w-md bg-zinc-800 border-2 border-yellow-500 rounded-lg p-6 text-center"
              >
                <h3 className="text-yellow-500 uppercase tracking-wider mb-4">Enter Game Code</h3>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={playerCodeInput}
                  onChange={(e) => setPlayerCodeInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  onKeyDown={(e) => e.key === 'Enter' && handlePlayerCodeSubmit()}
                  placeholder="• • • •"
                  maxLength={4}
                  autoFocus
                  className="w-full bg-zinc-900 border-2 border-zinc-600 focus:border-yellow-500 rounded p-3 text-neutral-200 text-2xl text-center font-mono tracking-widest outline-none transition-colors mb-2"
                />
                {playerError && <p className="text-red-400 text-sm mt-1 mb-2">{playerError}</p>}
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={() => setShowPlayerPopup(false)}
                    variant="outline"
                    className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 h-10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePlayerCodeSubmit}
                    disabled={loading || playerCodeInput.trim().length < 4}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-zinc-900 h-10 disabled:opacity-50"
                  >
                    {loading ? 'Finding...' : 'Enter'}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
