import { initializeAuthTokenStore } from "./AuthTokenStore";
import { initializeDarkModeStore } from "./ColorSchemeStore";
import { initializeDevicesStore } from "./DevicesStore";
import { initializeFlashManagersStore } from "./FlashManagersStore";
import { initializeSerialPortsStore } from "./SerialPortsStore";
import { initializeUserStore } from "./UserStore";
import { browser } from '$app/environment';

export function initializeStores() {
  if (!browser) return;

  initializeAuthTokenStore();
  initializeDarkModeStore();
  initializeDevicesStore();
  initializeFlashManagersStore();
  initializeSerialPortsStore();
  initializeUserStore();
}
