import { SIDEBAR_COOKIE_NAME } from '$lib/components/ui/sidebar/constants';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ cookies }) => {
  // The sidebar provider writes this cookie on every toggle, but nothing reads
  // it back. Read it here so the server renders the persisted open/collapsed
  // state and we avoid a collapse-then-expand flash on hydration.
  return { sidebarOpen: cookies.get(SIDEBAR_COOKIE_NAME) === 'true' };
};
