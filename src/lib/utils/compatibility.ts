import { browser } from '$app/environment';
import { UAParser } from 'ua-parser-js';

let uaParser: UAParser | null = null;
function getParser() {
  if (!uaParser) {
    uaParser = new UAParser(navigator.userAgent || navigator.vendor);
  }
  return uaParser;
}

function mobileCheck() {
  if (!browser) return false;

  if (navigator.userAgentData?.mobile) return true;

  const type = getParser().getDevice().type;
  return type === 'mobile' || type === 'tablet';
}

export const isMobile = mobileCheck();
export const isSerialSupported =
  browser &&
  'serial' in navigator &&
  navigator.serial !== undefined &&
  typeof navigator.serial?.getPorts === 'function' &&
  typeof navigator.serial?.requestPort === 'function';

export function getBrowserName() {
  return getParser().getBrowser().name || '???';
}
