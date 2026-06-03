import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { supabase } from '../lib/supabase';
import { validateUsername } from '../lib/validateUsername';
import { generateRandomName } from '../lib/randomName';

interface CompleteProfilePageProps {
  userId: string;
  onComplete: () => void;
}

export function CompleteProfilePage({ userId, onComplete }: CompleteProfilePageProps) {
  const [username, setUsername] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const validationError = username.length > 0 ? validateUsername(username) : null;
  const canSubmit = username.length >= 3 && !validationError;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setShowWarning(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.trim())
        .maybeSingle();

      if (existing) {
        setError('That username is already taken. Please choose another.');
        setShowWarning(false);
        setLoading(false);
        return;
      }

      let role = 'free';
      if (inviteCode.trim()) {
        const { data: codeData } = await supabase
          .from('dev_codes')
          .select('code')
          .eq('code', inviteCode.trim().toUpperCase())
          .single();
        if (codeData) role = 'dev';
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: username.trim(), display_name: generateRandomName(), role })
        .eq('id', userId);

      if (updateError) throw updateError;
      onComplete();
    } catch (err: any) {
      if (err?.code === '23505') {
        setError('That username is already taken. Please choose another.');
      } else {
        setError(err.message ?? 'Something went wrong. Please try again.');
      }
      setShowWarning(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">

      {showWarning && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)', padding: '1rem' }}>
          <div className="bg-zinc-800 border-2 border-green-500 rounded-lg p-6 w-full max-w-sm text-center">
            <h3 className="text-neutral-200 font-bold mb-3 uppercase tracking-wide">Are you sure?</h3>
            <p className="text-neutral-400 mb-1" style={{ fontSize: '14px' }}>
              Your username will be:
            </p>
            <p className="text-green-500 font-bold mb-4" style={{ fontSize: '18px' }}>{username}</p>
            <p className="text-neutral-500 mb-6" style={{ fontSize: '13px' }}>
              This cannot be changed once saved.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowWarning(false)}
                variant="outline"
                className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 h-10"
              >
                Go Back
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-zinc-900 h-10 disabled:opacity-60"
              >
                {loading ? 'Saving...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <h2 className="text-green-500 uppercase tracking-wider text-center font-bold mb-2">
          Create Your Username
        </h2>
        <div className="h-1 w-20 bg-green-500 mx-auto mb-6" />

        <div className="flex flex-col gap-4">

          <div className="w-full">
            <label className="text-neutral-400 uppercase tracking-wider mb-1 block" style={{ fontSize: '14px' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 24));
                setError(null);
              }}
              placeholder="e.g. SilverHawk42"
              maxLength={24}
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full bg-zinc-800 border-2 border-zinc-600 focus:border-green-500 rounded px-4 py-2 text-neutral-200 outline-none transition-colors"
              style={{ fontSize: '14px' }}
            />
            {validationError && (
              <p className="text-red-400 mt-1" style={{ fontSize: '13px' }}>{validationError}</p>
            )}
          </div>

          <p className="text-neutral-500 text-center" style={{ fontSize: '13px' }}>
            Letters and numbers only · Max 24 characters · Cannot be changed once saved
          </p>

          <div className="w-full">
            <label className="text-neutral-400 uppercase tracking-wider mb-1 block" style={{ fontSize: '14px' }}>
              Invite Code <span className="text-neutral-600">(optional)</span>
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder=" "
              title="Invite code"
              className="w-full bg-zinc-800 border-2 border-zinc-600 focus:border-green-500 rounded px-4 py-2 text-neutral-200 outline-none transition-colors"
              style={{ fontSize: '14px', padding: '0.5rem 1rem' }}
            />
          </div>

          {error && (
            <p className="text-red-400 text-center" style={{ fontSize: '14px' }}>{error}</p>
          )}

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-zinc-900 h-12 disabled:opacity-50"
            style={{ fontSize: '14px' }}
          >
            Continue
          </Button>

        </div>
      </motion.div>
    </div>
  );
}
