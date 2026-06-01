import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

const DBL_CLICK_KEY = 'fanatic_dbl_click';

interface AccountPageProps {
  displayName: string;
  email: string;
  role: string;
  onBack: () => void;
  onSignOut: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  free: 'Free',
  pass: 'Pass',
  premium: 'Premium',
  dev: 'Dev',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  free: 'Unlimited games at the standard feature set.', // Premium features are visible but locked.
  pass: 'Temporary premium access including Create Your Own board, league filters, and Blackout Bingo. Access lasts for the duration of the pass.',
  premium: 'Full access to all features including custom term submission for the Fanatic Bingo term library and all future premium content.',
  dev: 'Internal testing account with full premium access.',
};

export function AccountPage({ displayName, email, role, onBack, onSignOut }: AccountPageProps) {
  const roleLabel = ROLE_LABELS[role] ?? 'Free';
  const roleDescription = ROLE_DESCRIPTIONS[role] ?? ROLE_DESCRIPTIONS.free;
  const [doubleClick, setDoubleClick] = useState(() => localStorage.getItem(DBL_CLICK_KEY) === 'true');

  const toggleDoubleClick = () => {
    const next = !doubleClick;
    setDoubleClick(next);
    localStorage.setItem(DBL_CLICK_KEY, String(next));
  };

  return (
    <div className="min-h-screen flex flex-col p-4">
      <div className="w-full max-w-md mx-auto">
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

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-green-500 uppercase tracking-wider text-center font-bold mb-2">
            Your Account
          </h2>
          <div className="h-1 w-20 bg-green-500 mx-auto mb-6" />

          <div className="flex flex-col gap-4">

            {/* Display name */}
            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <p className="text-neutral-500 uppercase tracking-wider mb-1" style={{ fontSize: '11px' }}>Display Name</p>
              <p className="text-neutral-200" style={{ fontSize: '15px' }}>{displayName || '—'}</p>
            </div>

            {/* Email */}
            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <p className="text-neutral-500 uppercase tracking-wider mb-1" style={{ fontSize: '11px' }}>Email</p>
              <p className="text-neutral-200" style={{ fontSize: '15px' }}>{email || '—'}</p>
            </div>

            {/* Account level */}
            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <p className="text-neutral-500 uppercase tracking-wider mb-1" style={{ fontSize: '11px' }}>Account Level</p>
              <p className="text-green-500 font-semibold mb-2" style={{ fontSize: '15px' }}>{roleLabel}</p>
              <p className="text-neutral-400 leading-relaxed" style={{ fontSize: '13px' }}>{roleDescription}</p>
            </div>

            {/* Preferences */}
            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <p className="text-neutral-500 uppercase tracking-wider mb-3" style={{ fontSize: '11px' }}>Preferences</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-200" style={{ fontSize: '14px' }}>Double-tap to mark</p>
                  <p className="text-neutral-500 mt-0.5" style={{ fontSize: '12px' }}>Mark squares instantly without confirmation</p>
                </div>
                <button
                  type="button"
                  onClick={toggleDoubleClick}
                  style={{
                    width: '44px', height: '24px', borderRadius: '12px', flexShrink: 0,
                    backgroundColor: doubleClick ? '#17BB34' : '#3f3f46',
                    position: 'relative', transition: 'background-color 0.2s', border: 'none', cursor: 'pointer'
                  }}
                  aria-label="Toggle double-tap to mark"
                >
                  <span style={{
                    position: 'absolute', top: '2px',
                    left: doubleClick ? '22px' : '2px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    backgroundColor: 'white', transition: 'left 0.2s'
                  }} />
                </button>
              </div>
            </div>

            {/* Purchase history placeholder */}
            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <p className="text-neutral-500 uppercase tracking-wider mb-1" style={{ fontSize: '11px' }}>Purchase History</p>
              <p className="text-neutral-500" style={{ fontSize: '13px' }}>No purchases yet.</p>
            </div>

            {/* Sign out */}
            <Button
              onClick={onSignOut}
              variant="outline"
              className="w-full border-zinc-600 text-neutral-400 hover:bg-zinc-800 hover:text-red-400 hover:border-red-400 h-10 mt-2"
            >
              Sign Out
            </Button>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
