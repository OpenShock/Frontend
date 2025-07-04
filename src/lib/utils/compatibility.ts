import { browser } from '$app/environment';
import { UAParser } from 'ua-parser-js';

const current = new UAParser(navigator.userAgent || navigator.vendor);

function checkSerialSupport(): { supported: true } | { supported: false, reason: string } {
  if (!browser) return { supported: false, reason: 'Not a browser' };

  const supported = 'serial' in navigator &&
    typeof navigator.serial.getPorts === 'function' &&
    typeof navigator.serial.requestPort === 'function' &&
    typeof navigator.serial.addEventListener === 'function';
  if (supported) return { supported: true };

  const browserInfo = current.getBrowser();

  const supportedBrowsers = new Map([
    ['Chrome', 89],
    ['Edge', 89],
    ['Opera', 75]
  ]);

  const supportedVersion = supportedBrowsers.get(browserInfo.name ?? 'Unkown');
  if (!supportedVersion) return { supported: false, reason: 'This browser brand does not support serial WebAPI' };

  return { supported: false, reason: 'Upgrade your browser' }
}

export const isMobile = browser && (navigator.userAgentData?.mobile || current.getDevice().type === 'mobile');
export const serialSupport = checkSerialSupport();

