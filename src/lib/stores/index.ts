import { initializeStores as initializeSkeletonStores, storePopup } from '@skeletonlabs/skeleton';
import { initializeAuthTokenStore } from "./AuthTokenStore";
import { initializeDarkModeStore } from "./DarkModeStore";
import { initializeDevicesStore } from "./DevicesStore";
import { initializeFlashManagersStore } from "./FlashManagersStore";
import { initializeSerialPortsStore } from "./SerialPortsStore";
import { initializeUserStore } from "./UserStore";
import { browser } from '$app/environment';

export function initializeStores() {
  if (!browser) return;

  storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
  initializeSkeletonStores();

  initializeAuthTokenStore();
  initializeDarkModeStore();
  initializeDevicesStore();
  initializeFlashManagersStore();
  initializeSerialPortsStore();
  initializeUserStore();
}
