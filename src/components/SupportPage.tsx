import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface SupportPageProps {
  onBack: () => void;
  userEmail?: string;
}

const CATEGORIES = [
  'Bug / Something isn\'t working',
  'Account issue',
  'Feedback / Suggestion',
  'Other',
];

export function SupportPage({ onBack, userEmail }: SupportPageProps) {
  const [email, setEmail] = useState(userEmail ?? '');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = category.length > 0 && message.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('https://formspree.io/f/xzdqzdrz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: email.trim() || 'Not provided',
          category,
          message: message.trim(),
        }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
            Submit an Issue
          </h2>
          <div className="h-1 w-20 bg-green-500 mx-auto mb-6" />

          {submitted ? (
            <div className="text-center">
              <p className="text-neutral-200 mb-2" style={{ fontSize: '15px' }}>
                Thank you for your message.
              </p>
              <p className="text-neutral-400" style={{ fontSize: '14px' }}>
                We'll be in touch at support@fanaticbingo.com.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">

              <div className="w-full">
                <label className="text-neutral-400 uppercase tracking-wider mb-1 block" style={{ fontSize: '14px' }}>
                  Your Email <span className="text-neutral-600">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-zinc-800 border-2 border-zinc-600 focus:border-green-500 rounded px-4 py-2 text-neutral-200 outline-none transition-colors"
                  style={{ fontSize: '14px' }}
                />
              </div>

              <div className="w-full">
                <label className="text-neutral-400 uppercase tracking-wider mb-1 block" style={{ fontSize: '14px' }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-800 border-2 border-zinc-600 focus:border-green-500 rounded px-4 py-2 text-neutral-200 outline-none transition-colors"
                  style={{ fontSize: '14px' }}
                >
                  <option value="" disabled>Select a category...</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="w-full">
                <label className="text-neutral-400 uppercase tracking-wider mb-1 block" style={{ fontSize: '14px' }}>
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the issue..."
                  rows={5}
                  className="w-full bg-zinc-800 border-2 border-zinc-600 focus:border-green-500 rounded px-4 py-2 text-neutral-200 outline-none transition-colors resize-none"
                  style={{ fontSize: '14px' }}
                />
              </div>

              {error && (
                <p className="text-red-400 text-center" style={{ fontSize: '14px' }}>{error}</p>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!isValid || submitting}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-zinc-900 h-12 disabled:opacity-50"
                style={{ fontSize: '14px' }}
              >
                {submitting ? 'Sending...' : 'Send'}
              </Button>

            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
