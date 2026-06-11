import { SIDEBAR_COOKIE_NAME } from '$lib/components/ui/sidebar/constants';
import { WELCOME_COOKIE_NAME } from '$lib/tour/onboarding-state';
import type { LayoutServerLoad } from './$types';

const CURRENT_WELCOME_VERSION = 1;

export const load: LayoutServerLoad = ({ cookies }) => {
  // The sidebar provider writes this cookie on every toggle, but nothing reads
  // it back. Read it here so the server renders the persisted open/collapsed
  // state and we avoid a collapse-then-expand flash on hydration.
  const sidebarOpen = cookies.get(SIDEBAR_COOKIE_NAME) === 'true';

  // Determine server-side whether to SSR the welcome screen, so the logo is
  // in the initial HTML for new visitors rather than loaded after JS runs.
  const welcomeRaw = cookies.get(WELCOME_COOKIE_NAME);
  const showWelcome = !welcomeRaw || parseInt(welcomeRaw, 10) < CURRENT_WELCOME_VERSION;

  return { sidebarOpen, showWelcome };
};
