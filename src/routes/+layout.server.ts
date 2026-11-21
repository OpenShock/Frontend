import { SIDEBAR_COOKIE_NAME } from '@openshock/svelte-core/components/ui/sidebar/constants.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ cookies }) => {
  // The sidebar provider writes this cookie on every toggle, but nothing reads
  // it back. Read it here so the server renders the persisted open/collapsed
  // state and we avoid a collapse-then-expand flash on hydration.
  const sidebarOpen = cookies.get(SIDEBAR_COOKIE_NAME) === 'true';

  return { sidebarOpen };
};
