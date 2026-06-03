import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Button } from './ui/button';
import { joinSessionByCode } from '../lib/sessions';
import { SessionInfo, Sport } from '../App';

interface GuestLoginProps {
  user: SupabaseUser;
  defaultJoinCode?: string;
  defaultUsername?: string;
  onBack: () => void;
  onJoined: (sessionInfo: SessionInfo, sport: Sport) => void;
}

export function GuestLogin({ user, defaultJoinCode, defaultUsername, onBack, onJoined }: GuestLoginProps) {
  const isGuest = user.is_anonymous;
  const [displayName, setDisplayName] = useState(defaultUsername ?? '');
  const [joinCode, setJoinCode] = useState(defaultJoinCode ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playerName = isGuest ? displayName.trim() : (defaultUsername ?? '');
  const isValid = joinCode.trim().length === 6 && playerName.length >= 2;

  const handleContinue = async () => {
    const code = joinCode.trim().toUpperCase();
    setLoading(true);
    setError(null);
    try {
      const { session, player } = await joinSessionByCode(code, user.id, playerName);
      onJoined(
        {
          sessionId: session.id,
          playerId: player.id,
          groupName: session.group_name,
          initials: playerName,
          isHost: false,
          joinCode: code,
        },
        session.sport as Sport
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <div className="mb-4">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-neutral-300 hover:bg-zinc-800 hover:text-green-500 h-8 px-3"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-green-500 uppercase tracking-widest text-3xl font-bold mb-3">
            Join Game
          </h1>
          {!isGuest && (
            <p className="text-neutral-400 text-sm">
              Playing as <span className="text-neutral-200">{defaultUsername}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-5">

          {isGuest && (
            <div className="w-full">
              <label className="text-neutral-400 uppercase tracking-wider mb-1 block text-center" style={{ fontSize: '14px' }}>
                Your Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value.slice(0, 18))}
                placeholder="e.g. Jordan"
                maxLength={18}
                className="w-full bg-zinc-800 border-2 border-zinc-600 focus:border-green-500 rounded px-4 py-2 text-lg text-neutral-200 text-center outline-none transition-colors"
              />
              {displayName.length > 0 && displayName.trim().length < 2 && (
                <p className="text-red-400 text-xs text-center mt-1">Minimum 2 characters</p>
              )}
            </div>
          )}

          <div className="w-full">
            <label className="text-neutral-400 uppercase tracking-wider mb-1 block text-center" style={{ fontSize: '14px' }}>
              Game Code
            </label>
            <input
              type="text"
              inputMode="text"
              value={joinCode}
              onChange={(e) => setJoinCode(
                e.target.value.toUpperCase().replace(/[^ABCDEFGHJKLMNPQRSTUVWXYZ23456789]/g, '').slice(0, 6)
              )}
              onKeyDown={(e) => e.key === 'Enter' && isValid && handleContinue()}
              placeholder="XXXXXX"
              maxLength={6}
              className="w-full bg-zinc-800 border-2 border-zinc-600 focus:border-green-500 rounded px-4 py-2 text-lg text-neutral-200 text-center font-mono tracking-widest outline-none transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <Button
            onClick={handleContinue}
            disabled={!isValid || loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-zinc-900 h-12 text-lg disabled:from-zinc-600 disabled:to-zinc-700 disabled:text-neutral-400 disabled:opacity-100 disabled:cursor-not-allowed"
          >
            {loading ? 'Joining...' : 'Continue'}
          </Button>

        </div>
      </motion.div>
    </div>
  );
}
