import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, Menu, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Button } from './ui/button';

interface SessionLobbyProps {
  user: SupabaseUser;
  username: string;
  onSolo: () => void;
  onMultiplayerCreate: () => void;
  onJoin: (code: string) => Promise<void>;
  onFaq: () => void;
  onPrivacyPolicy: () => void;
  onTermsOfService: () => void;
  onAccount: () => void;
  onSupport: () => void;
  onHowToPlay: () => void;
  onHowToPlayText: () => void;
  onShowLogin: (mode: 'signin' | 'signup') => void;
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

export function SessionLobby({ user, username, onSolo, onMultiplayerCreate, onJoin, onFaq, onPrivacyPolicy, onTermsOfService, onAccount, onSupport, onHowToPlay, onHowToPlayText, onShowLogin }: SessionLobbyProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLobbyQR, setShowLobbyQR] = useState(false);
  const [infoPopup, setInfoPopup] = useState<'solo' | 'multiplayer' | 'join' | null>(null);
  const [joinExpanded, setJoinExpanded] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  const handleToggleJoin = () => {
    const next = !joinExpanded;
    setJoinExpanded(next);
    setJoinCode('');
    setJoinError(null);
    if (next) setTimeout(() => codeRef.current?.focus(), 50);
  };

  const handleJoinSubmit = async () => {
    if (joinCode.length !== 6 || joinLoading) return;
    setJoinLoading(true);
    setJoinError(null);
    try {
      await onJoin(joinCode);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Could not join session.');
      setJoinLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4">

      <div className="w-full flex justify-start mb-2">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="text-neutral-400 hover:text-green-500 transition-colors p-1"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-4">
            <img src="/fanatic-bingo-logo.png" alt="Fanatic Bingo" className="mx-auto mb-1" style={{ maxWidth: '240px', width: '100%' }} />
            <p className="tracking-wider mb-2" style={{ color: GREEN, fontSize: '16px' }}>By Fans, For Fans.</p>
            <div className="h-1 w-20 mx-auto" style={{ backgroundColor: GREEN }} />
          </div>

          {/* Username display */}
          <div className="w-full mb-4 text-center">
            {!user.is_anonymous ? (
              <p className="text-neutral-200" style={{ fontSize: '18px' }}>
                Welcome, <span style={{ color: GREEN, fontWeight: 600 }}>{username}</span>!
              </p>
            ) : (
              <>
                <p className="text-neutral-400 mb-2" style={{ fontSize: '14px' }}>
                  Playing as <span className="text-neutral-300">{username}</span> (Guest)
                </p>
                <div className="flex gap-4">
                  <button type="button" onClick={() => onShowLogin('signin')} className="text-neutral-500 hover:text-green-500 transition-colors" style={{ fontSize: '13px' }}>
                    Sign in
                  </button>
                  <button type="button" onClick={() => onShowLogin('signup')} className="text-neutral-500 hover:text-green-500 transition-colors" style={{ fontSize: '13px' }}>
                    Create account
                  </button>
                </div>
              </>
            )}
          </div>

          <p className="text-neutral-400 text-center mb-3">How do you want to play?</p>

          <div className="flex flex-col gap-3">

            <div className="flex items-center gap-2">
              <div className="w-9 shrink-0" />
              <div className="flex-1 flex rounded overflow-hidden" style={{ border: `2px solid ${GREEN}` }}>
                <Button
                  onClick={onSolo}
                  className="flex-1 bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-neutral-200 text-lg justify-center rounded-none h-12"
                >
                  Private Game
                </Button>
                <button
                  type="button"
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

            <div className="flex items-center gap-2">
              <div className="w-9 shrink-0" />
              <div className="flex-1 flex rounded overflow-hidden" style={{ border: `2px solid ${GREEN}` }}>
                <Button
                  onClick={onMultiplayerCreate}
                  className="flex-1 bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-neutral-200 text-lg justify-center rounded-none h-12"
                >
                  Multiplayer Game
                </Button>
                <button
                  type="button"
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
                  type="button"
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

          <div className="flex flex-col items-center gap-3 mt-5">
            <button
              type="button"
              onClick={onHowToPlay}
              className="text-neutral-500 hover:text-green-500 transition-colors uppercase tracking-wider"
              style={{ fontSize: '16px' }}
            >
              How to Play
            </button>
            <button
              type="button"
              onClick={() => setShowLobbyQR(true)}
              className="text-neutral-500 hover:text-green-500 transition-colors"
              aria-label="Show QR code"
            >
              <QrCode className="w-6 h-6" />
            </button>
          </div>

        </motion.div>
      </div>

      {/* Menu bottom sheet */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
              className="bg-zinc-800"
              style={{ position: 'fixed', top: 0, bottom: 0, left: 0, width: '260px', zIndex: 50, borderRight: `4px solid ${GREEN}`, borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}
            >
              <div className="p-6 flex flex-col gap-1 h-full">
                {!user.is_anonymous && (
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onAccount(); }}
                    className="text-left text-neutral-200 hover:text-green-500 transition-colors py-3 border-b border-zinc-700"
                    style={{ fontSize: '15px' }}
                  >
                    My Account
                  </button>
                )}
                <button type="button" onClick={() => { setMenuOpen(false); onHowToPlayText(); }} className="text-left text-neutral-200 hover:text-green-500 transition-colors py-3 border-b border-zinc-700" style={{ fontSize: '15px' }}>How to Play</button>
                <button type="button" onClick={() => { setMenuOpen(false); onFaq(); }} className="text-left text-neutral-200 hover:text-green-500 transition-colors py-3 border-b border-zinc-700" style={{ fontSize: '15px' }}>FAQs</button>
                <button type="button" onClick={() => { setMenuOpen(false); onPrivacyPolicy(); }} className="text-left text-neutral-200 hover:text-green-500 transition-colors py-3 border-b border-zinc-700" style={{ fontSize: '15px' }}>Privacy Policy</button>
                <button type="button" onClick={() => { setMenuOpen(false); onTermsOfService(); }} className="text-left text-neutral-200 hover:text-green-500 transition-colors py-3 border-b border-zinc-700" style={{ fontSize: '15px' }}>Terms of Service</button>
                <button type="button" onClick={() => { setMenuOpen(false); onSupport(); }} className="text-left text-neutral-200 hover:text-green-500 transition-colors py-3" style={{ fontSize: '15px' }}>Submit an Issue</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Lobby QR modal */}
      <AnimatePresence>
        {showLobbyQR && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLobbyQR(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed z-50 bg-zinc-800 rounded-xl p-6 flex flex-col items-center gap-4"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '280px', border: `2px solid ${GREEN}` }}
            >
              <div className="w-full flex items-center justify-between">
                <p className="text-green-500 uppercase tracking-wider font-semibold" style={{ fontSize: '12px' }}>Fanatic Bingo</p>
                <button
                  type="button"
                  onClick={() => setShowLobbyQR(false)}
                  className="text-neutral-500 hover:text-neutral-200 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <QRCodeSVG value="https://fanaticbingo.com" size={180} level="M" />
              </div>
              <p className="text-neutral-400" style={{ fontSize: '12px' }}>fanaticbingo.com</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                <h3 className="text-neutral-200 uppercase tracking-wide mb-3">{INFO[infoPopup].title}</h3>
                <p className="text-neutral-400 mb-6">{INFO[infoPopup].description}</p>
                <Button onClick={() => setInfoPopup(null)} className="w-full text-zinc-900 h-10" style={{ background: `linear-gradient(to right, ${GREEN}, ${GREEN_DARK})` }}>Ok</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
