import { containsProfanity } from './profanity';

export function validateUsername(value: string): string | null {
  if (value.length < 3) return 'Username must be at least 3 characters.';
  if (value.length > 24) return 'Username must be 24 characters or fewer.';
  if (!/^[a-zA-Z0-9]+$/.test(value)) return 'Letters and numbers only — no spaces or special characters.';
  if (containsProfanity(value)) return 'That username is not allowed.';
  return null;
}
