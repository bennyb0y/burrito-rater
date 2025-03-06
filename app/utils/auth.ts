// Simple hash function that returns a number between 0 and max-1
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// List of emojis to use for user identification
const userEmojis = [
  '🦊', '🐼', '🐨', '🦁', '🐯', '🐮', '🐷', '🐸',
  '🐙', '🦄', '🦋', '🐢', '🐬', '🦈', '🦭', '🦩',
  '🦜', '🐝', '🦖', '🐳', '🦚', '🦡', '🦨', '🦦'
];

export function generateUserEmoji(password: string): string {
  const hash = simpleHash(password);
  return userEmojis[hash % userEmojis.length];
}

export function validatePassword(password: string): boolean {
  return password.length >= 4;
}

// Type for the user identity
export interface UserIdentity {
  name: string;
  emoji: string;
} 