import { PUBLIC_DISABLE_ONBOARDING } from '$env/static/public';
import { isTruthy } from '@openshock/svelte-core/utils/parse';

export const WELCOME_COOKIE_NAME = 'os.welcomed';
// Pre-cookie builds stored "welcome seen" under this localStorage key. Kept only
// for the migration fallback in hasSeenWelcome().
const LEGACY_WELCOME_STORAGE_KEY = 'os.welcomeVersion';
const WELCOME_COOKIE_EXPIRES = new Date('2026-07-10');
// Retire the welcome screen one day before the cookie expires, so it can't briefly
// reappear for everyone in the window where the cookie lapses.
const WELCOME_SUNSET = new Date(WELCOME_COOKIE_EXPIRES.getTime() - 24 * 60 * 60 * 1000);

export function isWelcomeSunset(): boolean {
  return Date.now() >= WELCOME_SUNSET.getTime();
}

const CURRENT_TOUR_VERSION = 1;
const TOUR_VERSION_KEY = 'os.tourCompletedVersion';

export function isOnboardingDisabled(): boolean {
  return isTruthy(PUBLIC_DISABLE_ONBOARDING);
}

function readWelcomeCookie(): boolean {
  try {
    const escapedName = WELCOME_COOKIE_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escapedName}=([^;]*)`));
    return match ? isTruthy(decodeURIComponent(match[1])) : false;
  } catch {
    return false;
  }
}

export function hasSeenWelcome(): boolean {
  // Check cookie (new path) then fall back to localStorage (migration). isTruthy
  // also accepts the legacy version value "1", so pre-existing state still counts.
  if (readWelcomeCookie()) return true;
  try {
    return isTruthy(localStorage.getItem(LEGACY_WELCOME_STORAGE_KEY));
  } catch {
    return false;
  }
}

export function markWelcomed(): void {
  try {
    // Synchronous document.cookie write. The async cookieStore API would also work
    // (Chrome 87+, Firefox 140+, Safari 18.4+), but for a one-shot write it buys
    // nothing and drops older browsers, so the plain string write is preferred.
    document.cookie = `${WELCOME_COOKIE_NAME}=true; path=/; expires=${WELCOME_COOKIE_EXPIRES.toUTCString()}; SameSite=Lax`;
  } catch {
    // ignore
  }
}

export function shouldShowWelcome(): boolean {
  if (isOnboardingDisabled() || isWelcomeSunset()) return false;
  return !hasSeenWelcome();
}

export function hasCompletedTour(): boolean {
  if (isOnboardingDisabled()) return true;
  try {
    const raw = localStorage.getItem(TOUR_VERSION_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n >= CURRENT_TOUR_VERSION;
  } catch {
    return false;
  }
}

export function markTourCompleted(): void {
  try {
    localStorage.setItem(TOUR_VERSION_KEY, String(CURRENT_TOUR_VERSION));
  } catch {
    // ignore
  }
}
