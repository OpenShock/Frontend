import { initializeApiTokenStore } from './ApiTokensStore';
import { initializeDarkModeStore } from './ColorSchemeStore';
import { initializeDevicesStore } from './HubsStore';
import { initializeFlashManagersStore } from './FlashManagersStore';
import { initializeSerialPortsStore } from './SerialPortsStore';
import { initializeUserStore } from './UserStore';
import { browser } from '$app/environment';

export function initializeStores() {
  if (!browser) return;

  initializeApiTokenStore;
  initializeDarkModeStore();
  initializeDevicesStore();
  initializeFlashManagersStore();
  initializeSerialPortsStore();
  initializeUserStore();
}
