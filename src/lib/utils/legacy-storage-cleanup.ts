// Keys written by features that no longer exist. Nothing reads them anymore, so clear them out of
// returning visitors' browsers instead of leaving them behind forever.
const LEGACY_STORAGE_KEYS = [
  // Welcome screen and onboarding tour, removed after the welcome screen's sunset.
  'os.welcomeVersion',
  'os.tourCompletedVersion',
];

/** Removes localStorage keys left behind by removed features. Safe to call on every page load. */
export function removeLegacyStorage(): void {
  try {
    for (const key of LEGACY_STORAGE_KEYS) localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable (privacy mode, blocked site data); there is nothing to clean then.
  }
}
