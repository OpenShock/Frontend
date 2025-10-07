import { browser } from "$app/environment";
import { isMobile } from "$lib/utils/compatibility";

const KEY = 'sidebarOpen';

function init() {
  if (!browser || isMobile) return false;

  const valueStr = localStorage.getItem(KEY);
  const value = valueStr === 'true';

  // Remove invalid entries
  if (!value && valueStr !== 'false') {
    localStorage.removeItem(KEY);
  }

  return value;
}

let state = $state<boolean>(init());

export const SidebarOpen = {
  get Value() {
    return state;
  },
  set Value(value: boolean) {
    state = value;
    if (browser && !isMobile) {
      localStorage.setItem(KEY, value ? 'true' : 'false');
    }
  }
};
