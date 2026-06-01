import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface TermsOfServiceProps {
  onBack: () => void;
}

const sections: { title: string; body: string }[] = [
  {
    title: 'Agreement to Terms',
    body: 'By accessing or using Fanatic Bingo, operated by Turquoise Sunrise LLC, you agree to be bound by these Terms of Service. If you do not agree, please do not use the app.',
  },
  {
    title: 'Use of the App',
    body: 'Fanatic Bingo is intended for entertainment purposes only. You agree to use the app in a lawful manner and not to misuse, reverse-engineer, or attempt to exploit any part of the service. You must be at least 13 years of age to use this app.',
  },
  {
    title: 'Accounts',
    body: 'You may use Fanatic Bingo without an account for your first game. Creating an account requires a valid email address. You are responsible for maintaining the security of your account and for all activity that occurs under it. We reserve the right to suspend or terminate accounts that violate these terms.',
  },
  {
    title: 'Purchases and Passes',
    body: 'Fanatic Bingo offers optional paid features including time-limited Passes and a Premium subscription. All purchases are final and non-refundable unless required by applicable law. Passes expire at the end of the selected duration and do not roll over.',
  },
  {
    title: 'Intellectual Property',
    body: 'All content, branding, and code within Fanatic Bingo are the property of Turquoise Sunrise LLC. You may not reproduce, distribute, or create derivative works from any part of the app without written permission.',
  },
  {
    title: 'Disclaimer of Warranties',
    body: 'Fanatic Bingo is provided "as is" without warranties of any kind. We do not guarantee that the app will be available at all times, error-free, or free from interruptions. Use the app at your own risk.',
  },
  {
    title: 'Limitation of Liability',
    body: 'To the fullest extent permitted by law, Turquoise Sunrise LLC shall not be liable for any indirect, incidental, or consequential damages arising from your use of or inability to use the app.',
  },
  {
    title: 'Changes to These Terms',
    body: 'We may update these Terms of Service from time to time. Continued use of the app after changes are posted constitutes acceptance of the updated terms. We will make reasonable efforts to notify users of significant changes.',
  },
  {
    title: 'Contact',
    body: 'If you have questions about these Terms of Service, please contact us at support@fanaticbingo.com.',
  },
];

export function TermsOfService({ onBack }: TermsOfServiceProps) {
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
            Terms of Service
          </h2>
          <div className="h-1 w-20 bg-green-500 mx-auto mb-6" />

          <div className="flex flex-col gap-5 pb-12">
            {sections.map((s) => (
              <div key={s.title}>
                <h3 className="text-neutral-200 font-semibold mb-1" style={{ fontSize: '14px' }}>
                  {s.title}
                </h3>
                <p className="text-neutral-400 leading-relaxed" style={{ fontSize: '13px' }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
