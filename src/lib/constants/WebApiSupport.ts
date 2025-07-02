import { browser } from "$app/environment";

export const isSerialSupported = browser && Object.hasOwn(navigator, 'serial') && typeof navigator.serial.getPorts === 'function' && typeof navigator.serial.requestPort === 'function' && typeof navigator.serial.addEventListener === 'function';
