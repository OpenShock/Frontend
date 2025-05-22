import { browser } from '$app/environment';
import { initializeDarkModeStore } from './ColorSchemeStore';
import { initializeFlashManagersStore } from './FlashManagersStore';
import { initializeSerialPortsStore } from './SerialPortsStore';
import { initializeUserStore } from './UserStore';

export function initializeStores() {
  if (!browser) return;

  initializeDarkModeStore();
  initializeFlashManagersStore();
  initializeSerialPortsStore();
  initializeUserStore();
}
