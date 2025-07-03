import { browser } from '$app/environment';

export const isSerialSupported =
  browser &&
  'serial' in navigator &&
  typeof navigator.serial.getPorts === 'function' &&
  typeof navigator.serial.requestPort === 'function' &&
  typeof navigator.serial.addEventListener === 'function';
