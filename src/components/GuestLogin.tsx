import { useState } from 'react';
import { motion } from 'motion/react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Button } from './ui/button';
import { joinSessionByCode } from '../lib/sessions';
import { SessionInfo, Sport } from '../App';

interface GuestLoginProps {
  user: SupabaseUser;
  defaultJoinCode?: number;
  onBack: () => void;
  onJoined: (sessionInfo: SessionInfo, sport: Sport) => void;
}

export function GuestLogin({ user, onJoined }: GuestLoginProps) {
  const [initials, setInitials] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = initials.trim().length >= 2 && joinCode.trim().length === 4;

  const handleContinue = async () => {
    const code = parseInt(joinCode.trim(), 10);
    setLoading(true);
    setError(null);
    try {
      const { session, player } = await joinSessionByCode(code, user.id, initials.trim());
      onJoined(
        {
          sessionId: session.id,
          playerId: player.id,
          groupName: session.group_name,
          initials: initials.trim(),
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
        <div className="text-center mb-8">
          <h1 className="text-yellow-500 uppercase tracking-widest text-3xl font-bold mb-3">
            Welcome!
          </h1>
          <p className="text-neutral-200 text-sm leading-relaxed">
            Please enter your name or initials as you'd like to see them appear in the game. Then enter your code and click Continue to start your game.
          </p>
        </div>

        <div className="flex flex-col gap-5">

          {/* Initials */}
          <div className="w-full">
            <label className="text-neutral-400 text-xs uppercase tracking-wider mb-1 block text-center">
              Your Name or Initials
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

          {/* Join Code */}
          <div className="w-full">
            <label className="text-neutral-400 text-xs uppercase tracking-wider mb-1 block text-center">
              Game Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyDown={(e) => e.key === 'Enter' && isValid && handleContinue()}
              placeholder="• • • •"
              maxLength={4}
              className="w-full bg-zinc-800 border-2 border-zinc-600 focus:border-yellow-500 rounded p-3 text-neutral-200 text-2xl text-center font-mono tracking-widest outline-none transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <Button
            onClick={handleContinue}
            disabled={!isValid || loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-zinc-900 h-12 text-lg disabled:from-zinc-600 disabled:to-zinc-700 disabled:text-neutral-400 disabled:opacity-100 disabled:cursor-not-allowed"
          >
            {loading ? 'Joining...' : 'Continue'}
          </Button>

        </div>
      </motion.div>
    </div>
  );
}
