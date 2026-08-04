import {
  isOnboardingDisabled,
  isWelcomeSunset,
  WELCOME_COOKIE_NAME,
} from '$lib/tour/onboarding-state';
import { SIDEBAR_COOKIE_NAME } from '@openshock/svelte-core/components/ui/sidebar/constants.js';
import { isTruthy } from '@openshock/svelte-core/utils/parse.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ cookies }) => {
  // The sidebar provider writes this cookie on every toggle, but nothing reads
  // it back. Read it here so the server renders the persisted open/collapsed
  // state and we avoid a collapse-then-expand flash on hydration.
  const sidebarOpen = cookies.get(SIDEBAR_COOKIE_NAME) === 'true';

  // When onboarding is disabled the client unmounts the screen immediately on
  // hydration, so SSR-ing it just hurts LCP — skip it server-side too.
  if (isOnboardingDisabled()) {
    return { sidebarOpen, showWelcome: false };
  }

  // Past the sunset date the welcome screen is retired — never SSR it, and clear
  // the cookie if a returning visitor still has it set.
  if (isWelcomeSunset()) {
    if (cookies.get(WELCOME_COOKIE_NAME) !== undefined) {
      cookies.delete(WELCOME_COOKIE_NAME, { path: '/' });
    }
    return { sidebarOpen, showWelcome: false };
  }

  // SSR the welcome screen for visitors who haven't seen it, so the logo is in
  // the initial HTML rather than loaded after JS runs. Any non-truthy/missing
  // cookie (including malformed) counts as "not seen".
  const showWelcome = !isTruthy(cookies.get(WELCOME_COOKIE_NAME));

  return { sidebarOpen, showWelcome };
};
