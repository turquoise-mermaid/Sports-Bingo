import { useState } from 'react';
import { motion } from 'motion/react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Button } from './ui/button';
import { joinSessionByCode } from '../lib/sessions';
import { SessionInfo, Sport } from '../App';

interface GuestLoginProps {
  user: SupabaseUser;
  defaultJoinCode?: string;
  onBack: () => void;
  onJoined: (sessionInfo: SessionInfo, sport: Sport) => void;
}

export function GuestLogin({ user, defaultJoinCode, onJoined }: GuestLoginProps) {
  const [username, setUsername] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = username.trim().length >= 2 && joinCode.trim().length === 6;

  const handleUsernameChange = (val: string) => {
    const trimmed = val.slice(0, 18);
    if (!trimmed) { setUsername(''); return; }
    setUsername(trimmed[0].toUpperCase() + trimmed.slice(1).toLowerCase());
  };

  const handleContinue = async () => {
    const code = joinCode.trim().toUpperCase();
    setLoading(true);
    setError(null);
    try {
      const { session, player } = await joinSessionByCode(code, user.id, username.trim());
      onJoined(
        {
          sessionId: session.id,
          playerId: player.id,
          groupName: session.group_name,
          initials: username.trim(),
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
            Please enter your username as you'd like to see it appear in the game. Then enter your code and click Continue to start your game.
          </p>
        </div>

        <div className="flex flex-col gap-5">

          {/* Username */}
          <div className="w-full">
            <label className="text-neutral-400 text-xs uppercase tracking-wider mb-1 block text-center">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="e.g. Jordan"
              maxLength={18}
              className="w-full bg-zinc-800 border-2 border-zinc-600 focus:border-yellow-500 rounded p-3 text-neutral-200 text-center outline-none transition-colors"
            />
            {username.length > 0 && username.length < 2 && (
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
              inputMode="text"
              value={joinCode}
              onChange={(e) => setJoinCode(
                e.target.value.toUpperCase().replace(/[^ABCDEFGHJKLMNPQRSTUVWXYZ23456789]/g, '').slice(0, 6)
              )}
              onKeyDown={(e) => e.key === 'Enter' && isValid && handleContinue()}
              placeholder="• • • • • •"
              maxLength={6}
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
