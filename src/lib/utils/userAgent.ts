import { UAParser } from 'ua-parser-js';

export interface OpenShockUserAgent {
  version: string;
  framework: string;
  board: string;
  chip: string;
}

// Firmware user agents look like `OpenShock/<version> (<framework>; <board>; <chip>; Espressif)`.
export function parseOpenShockUserAgent(userAgent: string): OpenShockUserAgent | null {
  const match = /^OpenShock\/(\S+) \(([^)]*)\)/i.exec(userAgent);
  if (!match) return null;

  const details = match[2].split(';').map((part) => part.trim());
  if (details.length !== 4 || details.slice(0, 3).some((part) => !part)) return null;

  const [framework, board, chip] = details;
  return { version: match[1], framework, board, chip };
}

export const formatBoardName = (board: string) => board.replaceAll('-', ' ');

export const formatChipName = (chip: string) => chip.replace(/^ESP32([SC]\d+)$/i, 'ESP32-$1');

export function getReadableUserAgentName(userAgent: string): string | null {
  const openShock = parseOpenShockUserAgent(userAgent);
  if (openShock) {
    return `${formatBoardName(openShock.board)} · ${formatChipName(openShock.chip)}`;
  }

  const ua = new UAParser(userAgent);

  const browser = ua.getBrowser();
  const os = ua.getOS();

  if (!browser.name || !os.name) return null;

  let name = `${browser.name} on ${os.name}`;

  if (os.version) name += ` ${os.version}`;

  return name;
}
