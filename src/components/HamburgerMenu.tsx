import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu } from 'lucide-react';

const GREEN = '#17BB34';

interface HamburgerMenuProps {
  isAnonymous: boolean;
  onAccount: () => void;
  onHowToPlay: () => void;
  onFaq: () => void;
  onPrivacyPolicy: () => void;
  onTermsOfService: () => void;
  onSupport: () => void;
}

export function HamburgerMenu({ isAnonymous, onAccount, onHowToPlay, onFaq, onPrivacyPolicy, onTermsOfService, onSupport }: HamburgerMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="text-neutral-400 hover:text-green-500 transition-colors p-1"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

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
                {!isAnonymous && (
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onAccount(); }}
                    className="text-left text-neutral-200 hover:text-green-500 transition-colors py-3 border-b border-zinc-700"
                    style={{ fontSize: '15px' }}
                  >
                    My Account
                  </button>
                )}
                <button type="button" onClick={() => { setMenuOpen(false); onHowToPlay(); }} className="text-left text-neutral-200 hover:text-green-500 transition-colors py-3 border-b border-zinc-700" style={{ fontSize: '15px' }}>How to Play</button>
                <button type="button" onClick={() => { setMenuOpen(false); onFaq(); }} className="text-left text-neutral-200 hover:text-green-500 transition-colors py-3 border-b border-zinc-700" style={{ fontSize: '15px' }}>FAQs</button>
                <button type="button" onClick={() => { setMenuOpen(false); onPrivacyPolicy(); }} className="text-left text-neutral-200 hover:text-green-500 transition-colors py-3 border-b border-zinc-700" style={{ fontSize: '15px' }}>Privacy Policy</button>
                <button type="button" onClick={() => { setMenuOpen(false); onTermsOfService(); }} className="text-left text-neutral-200 hover:text-green-500 transition-colors py-3 border-b border-zinc-700" style={{ fontSize: '15px' }}>Terms of Service</button>
                <button type="button" onClick={() => { setMenuOpen(false); onSupport(); }} className="text-left text-neutral-200 hover:text-green-500 transition-colors py-3" style={{ fontSize: '15px' }}>Submit an Issue</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
