import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onSuccess: () => void;
  onContinueAsGuest: () => void;
  onBack: () => void;
  defaultMode?: 'signin' | 'signup';
}

type Mode = 'signin' | 'signup';

export function LoginPage({ onSuccess, onContinueAsGuest, onBack, defaultMode = 'signin' }: LoginPageProps) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const handleEmailAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.updateUser({ email, password });
        if (error) throw error;

        const userId = data.user?.id;
        if (userId) {
          let role = 'free';
          if (inviteCode.trim()) {
            const { data: codeData } = await supabase
              .from('dev_codes')
              .select('code')
              .eq('code', inviteCode.trim().toUpperCase())
              .single();
            if (codeData) role = 'dev';
          }
          await supabase.from('profiles').upsert({ id: userId, role });
        }

        setConfirmationSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error) setError(error.message);
  };

  const handleApple = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
  };

  const isValid = email.trim().length > 0 && password.length >= 8;

  if (confirmationSent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md text-center"
        >
          <h2 className="text-green-500 uppercase tracking-wider font-bold mb-4">Check Your Email</h2>
          <div className="h-1 w-20 bg-green-500 mx-auto mb-6" />
          <p className="text-neutral-400 mb-6" style={{ fontSize: '14px' }}>
            We sent a confirmation link to <span className="text-neutral-200">{email}</span>. Click the link to activate your account.
          </p>
          <Button
            type="button"
            onClick={onSuccess}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-zinc-900 h-12"
            style={{ fontSize: '14px' }}
          >
            Continue
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        {/* Back button */}
        <div className="mb-2">
          <Button
            type="button"
            onClick={onBack}
            variant="ghost"
            className="text-neutral-300 hover:bg-zinc-800 hover:text-green-500 h-8 px-3"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>

        {/* Title */}
        <h2 className="text-green-500 uppercase tracking-wider text-center font-bold mb-2">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h2>
        <div className="h-1 w-20 bg-green-500 mx-auto mb-6" />

        <div className="flex flex-col gap-4">

          {/* Email */}
          <div className="w-full">
            <label className="text-neutral-400 uppercase tracking-wider mb-1 block" style={{ fontSize: '14px' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#737373' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-zinc-800 border-2 border-zinc-600 focus:border-green-500 rounded text-neutral-200 outline-none transition-colors"
                style={{ fontSize: '14px', paddingLeft: '2.25rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="w-full">
            <label className="text-neutral-400 uppercase tracking-wider mb-1 block" style={{ fontSize: '14px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#737373' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full bg-zinc-800 border-2 border-zinc-600 focus:border-green-500 rounded text-neutral-200 outline-none transition-colors"
                style={{ fontSize: '14px', paddingLeft: '2.25rem', paddingRight: '2.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#737373', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {showPassword ? <EyeOff style={{ width: '1rem', height: '1rem' }} /> : <Eye style={{ width: '1rem', height: '1rem' }} />}
              </button>
            </div>
            {mode === 'signup' && password.length > 0 && password.length < 6 && (
              <p className="text-red-400 mt-1" style={{ fontSize: '14px' }}>Minimum 8 characters</p>
            )}
          </div>

          {/* Invite code (signup only) */}
          {mode === 'signup' && (
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
                className="w-full bg-zinc-800 border-2 border-zinc-600 focus:border-green-500 rounded text-neutral-200 outline-none transition-colors"
                style={{ fontSize: '14px', padding: '0.5rem 1rem' }}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-400 text-center" style={{ fontSize: '14px' }}>{error}</p>
          )}

          {/* Submit */}
          <Button
            type="button"
            onClick={handleEmailAuth}
            disabled={!isValid || loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-zinc-900 h-12 disabled:opacity-50"
            style={{ fontSize: '14px' }}
          >
            {loading ? '...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-700" />
            <span className="text-neutral-500" style={{ fontSize: '12px' }}>OR</span>
            <div className="flex-1 h-px bg-zinc-700" />
          </div>

          {/* Google */}
          <Button
            type="button"
            onClick={handleGoogle}
            variant="outline"
            className="w-full border-2 border-zinc-600 hover:border-zinc-500 text-neutral-200 hover:bg-zinc-800 h-12"
            style={{ fontSize: '14px' }}
          >
            <svg style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          {/* Continue as Guest */}
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="text-neutral-400 hover:text-neutral-400 transition-colors text-center"
            style={{ fontSize: '14px', fontWeight: 'normal' }}
          >
            Continue as Guest
          </button>

          {/* Toggle mode */}
          <p className="text-center text-neutral-400" style={{ fontSize: '14px' }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
              className="text-green-500 hover:text-green-400 transition-colors"
              style={{ fontWeight: 'normal' }}
            >
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </p>

        </div>
      </motion.div>
    </div>
  );
}
