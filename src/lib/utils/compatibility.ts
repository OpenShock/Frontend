import { browser } from '$app/environment';
import { UAParser } from 'ua-parser-js';

const parser = browser ? new UAParser(navigator.userAgent) : null;

function mobileCheck(): boolean {
  if (!browser) return false;

  // Fast path: Client Hints API (Chromium 85+)
  if (navigator.userAgentData?.mobile) return true;

  // Fallback: ua-parser-js regex parsing
  const type = parser!.getDevice().type;
  return type === 'mobile' || type === 'tablet';
}

export const isMobile = mobileCheck();

export const isSerialSupported =
  browser &&
  'serial' in navigator &&
  navigator.serial !== undefined &&
  typeof navigator.serial.getPorts === 'function' &&
  typeof navigator.serial.requestPort === 'function';

export function getBrowserName(): string {
  return parser?.getBrowser().name ?? '???';
}
