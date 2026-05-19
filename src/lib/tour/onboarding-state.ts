import { PUBLIC_DISABLE_ONBOARDING } from '$env/static/public';
import { isTruthy } from '$lib/utils/parse';

const CURRENT_WELCOME_VERSION = 1;
const WELCOME_VERSION_KEY = 'os.welcomeVersion';

const CURRENT_TOUR_VERSION = 1;
const TOUR_VERSION_KEY = 'os.tourCompletedVersion';

export function isOnboardingDisabled(): boolean {
  return isTruthy(PUBLIC_DISABLE_ONBOARDING);
}

export function hasSeenWelcome(): boolean {
  try {
    const raw = localStorage.getItem(WELCOME_VERSION_KEY);
    const seen = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(seen) && seen >= CURRENT_WELCOME_VERSION;
  } catch {
    return false;
  }
}

export function markWelcomed(): void {
  try {
    localStorage.setItem(WELCOME_VERSION_KEY, String(CURRENT_WELCOME_VERSION));
  } catch {
    // ignore (private mode, quota, etc.)
  }
}

export function shouldShowWelcome(): boolean {
  if (isOnboardingDisabled()) return false;
  try {
    const raw = localStorage.getItem(WELCOME_VERSION_KEY);
    const seen = raw ? parseInt(raw, 10) : 0;
    return !Number.isFinite(seen) || seen < CURRENT_WELCOME_VERSION;
  } catch {
    return false;
  }
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
