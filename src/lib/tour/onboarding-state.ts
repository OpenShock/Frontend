import { PUBLIC_DISABLE_ONBOARDING } from '$env/static/public';
import { isTruthy } from '$lib/utils/parse';

const CURRENT_WELCOME_VERSION = 1;
export const WELCOME_COOKIE_NAME = 'os.welcomeVersion';
const WELCOME_COOKIE_EXPIRES = new Date('2026-07-10');

const CURRENT_TOUR_VERSION = 1;
const TOUR_VERSION_KEY = 'os.tourCompletedVersion';

export function isOnboardingDisabled(): boolean {
  return isTruthy(PUBLIC_DISABLE_ONBOARDING);
}

function readWelcomeCookie(): number {
  try {
    const match = document.cookie.match(/(?:^|;\s*)os\.welcomeVersion=([^;]*)/);
    return match ? parseInt(match[1], 10) : 0;
  } catch {
    return 0;
  }
}

export function hasSeenWelcome(): boolean {
  // Check cookie (new path) then fall back to localStorage (migration).
  if (readWelcomeCookie() >= CURRENT_WELCOME_VERSION) return true;
  try {
    const raw = localStorage.getItem(WELCOME_COOKIE_NAME);
    const seen = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(seen) && seen >= CURRENT_WELCOME_VERSION;
  } catch {
    return false;
  }
}

export function markWelcomed(): void {
  try {
    cookieStore
      .set({
        name: WELCOME_COOKIE_NAME,
        value: String(CURRENT_WELCOME_VERSION),
        path: '/',
        expires: WELCOME_COOKIE_EXPIRES.getTime(),
        sameSite: 'lax',
      })
      .catch(() => {});
  } catch {
    // ignore
  }
}

export function shouldShowWelcome(): boolean {
  if (isOnboardingDisabled()) return false;
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
