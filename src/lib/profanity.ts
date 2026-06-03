const BLOCKED = [
  'fuck', 'shit', 'ass', 'bitch', 'cunt', 'cock', 'dick', 'pussy',
  'fag', 'nigger', 'nigga', 'chink', 'spic', 'kike', 'wetback', 'retard',
  'whore', 'slut', 'bastard', 'piss', 'crap', 'damn', 'hell', 'sex',
  'porn', 'nude', 'naked', 'boob', 'butt', 'anus', 'penis', 'vagina',
];

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED.some(word => lower.includes(word));
}
