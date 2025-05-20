import { initializeDarkModeStore } from './ColorSchemeStore';
import { initializeFlashManagersStore } from './FlashManagersStore';
import { initializeSerialPortsStore } from './SerialPortsStore';
import { initializeUserStore } from './UserStore';
import { browser } from '$app/environment';

export function initializeStores() {
  if (!browser) return;

  initializeDarkModeStore();
  initializeFlashManagersStore();
  initializeSerialPortsStore();
  initializeUserStore();
}
