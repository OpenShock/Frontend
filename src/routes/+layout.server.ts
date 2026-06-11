import { SIDEBAR_COOKIE_NAME } from '$lib/components/ui/sidebar/constants';
import { isWelcomeSunset, WELCOME_COOKIE_NAME } from '$lib/tour/onboarding-state';
import { isTruthy } from '$lib/utils/parse';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ cookies }) => {
  // The sidebar provider writes this cookie on every toggle, but nothing reads
  // it back. Read it here so the server renders the persisted open/collapsed
  // state and we avoid a collapse-then-expand flash on hydration.
  const sidebarOpen = cookies.get(SIDEBAR_COOKIE_NAME) === 'true';

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
