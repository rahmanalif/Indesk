const COOKIE_PREFIX = 'indesk_avail_prompt_';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function cookieName(userId: string) {
  return `${COOKIE_PREFIX}${userId}`;
}

export function hasAvailabilityPromptCookie(userId: string): boolean {
  if (!userId || typeof document === 'undefined') return false;
  const name = `${cookieName(userId)}=`;
  return document.cookie.split(';').some((part) => part.trim().startsWith(name));
}

export function setAvailabilityPromptCookie(userId: string): void {
  if (!userId || typeof document === 'undefined') return;
  document.cookie = `${cookieName(userId)}=1; Max-Age=${ONE_YEAR_SECONDS}; Path=/; SameSite=Lax`;
}
