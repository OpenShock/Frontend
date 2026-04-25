/**
 * Lightweight ANSI escape sequence parser for ESP-IDF serial output.
 * Converts ANSI SGR codes to inline CSS styles for rendering in the terminal.
 * Also parses ESP-IDF log format for structured log level, uptime, and tag extraction.
 */

export interface AnsiSegment {
  text: string;
  style: Record<string, string>;
}

import type { LogLevel } from './types';

export interface ParsedLogLine {
  logLevel: LogLevel;
  deviceUptime: number;
  tag: string;
  /** Index in the original string where the message content begins (after the metadata prefix). */
  messageOffset: number;
}

/**
 * Parse log formats. Supports:
 * - OpenShock: "[uptimeMs][LEVEL][file:line] message"
 * - ESP-IDF:   "LEVEL (uptimeMs) TAG: message"
 * May be preceded by ANSI escape sequences.
 */
const ANSI_PREFIX = /^(?:\x1b\[[0-9;]*[a-zA-Z])*/;
const LOG_OPENSHOCK_REGEX = new RegExp(
  ANSI_PREFIX.source + /\[\s*(\d+)\]\[([EWDIV])\]\[([^\]]+)\] ?/.source
);
const LOG_ESPIDF_REGEX = new RegExp(ANSI_PREFIX.source + /([EWDIV]) \((\d+)\) ([^:]+): ?/.source);

export function parseLogLine(text: string): ParsedLogLine | null {
  let match = LOG_OPENSHOCK_REGEX.exec(text);
  if (match) {
    return {
      logLevel: match[2] as LogLevel,
      deviceUptime: parseInt(match[1], 10),
      tag: match[3].trim(),
      messageOffset: match.index + match[0].length,
    };
  }
  match = LOG_ESPIDF_REGEX.exec(text);
  if (match) {
    return {
      logLevel: match[1] as LogLevel,
      deviceUptime: parseInt(match[2], 10),
      tag: match[3].trim(),
      messageOffset: match.index + match[0].length,
    };
  }
  return null;
}

const ANSI_COLORS: Record<number, string> = {
  30: '#000000', // black
  31: '#ff0000', // red
  32: '#00ff00', // green
  33: '#ffff00', // yellow
  34: '#0000ff', // blue
  35: '#ff00ff', // magenta
  36: '#00ffff', // cyan
  37: '#ffffff', // white
  90: '#808080', // bright black
  91: '#ff6b6b', // bright red
  92: '#51cf66', // bright green
  93: '#ffd93d', // bright yellow
  94: '#74c0fc', // bright blue
  95: '#ff8ed4', // bright magenta
  96: '#35d9d2', // bright cyan
  97: '#ffffff', // bright white
};

const ANSI_BG_COLORS: Record<number, string> = {
  40: '#000000',
  41: '#ff0000',
  42: '#00ff00',
  43: '#ffff00',
  44: '#0000ff',
  45: '#ff00ff',
  46: '#00ffff',
  47: '#ffffff',
  100: '#808080',
  101: '#ff6b6b',
  102: '#51cf66',
  103: '#ffd93d',
  104: '#74c0fc',
  105: '#ff8ed4',
  106: '#35d9d2',
  107: '#ffffff',
};

const ESC = '\x1b';
const ANSI_REGEX = new RegExp(`${ESC}\\[([0-9;]*?)([a-zA-Z])`, 'g');

/**
 * Parse ANSI escape sequences in text and return styled segments.
 */
export function parseAnsi(text: string): AnsiSegment[] {
  if (!text) return [{ text: '', style: {} }];

  const segments: AnsiSegment[] = [];
  let lastIndex = 0;
  let currentStyle: Record<string, string> = {};

  let match: RegExpExecArray | null;
  ANSI_REGEX.lastIndex = 0;

  while ((match = ANSI_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.substring(lastIndex, match.index), style: { ...currentStyle } });
    }

    const codes = match[1] ? match[1].split(';').map(Number) : [0];
    const command = match[2];

    if (command === 'm') {
      for (const code of codes) {
        if (code === 0) {
          currentStyle = {};
        } else if (code === 1) {
          currentStyle['font-weight'] = 'bold';
        } else if (code === 3) {
          currentStyle['font-style'] = 'italic';
        } else if (code === 4) {
          currentStyle['text-decoration'] = 'underline';
        } else if (code === 22) {
          delete currentStyle['font-weight'];
        } else if (code === 23) {
          delete currentStyle['font-style'];
        } else if (code === 24) {
          delete currentStyle['text-decoration'];
        } else if (code in ANSI_COLORS) {
          currentStyle['color'] = ANSI_COLORS[code];
        } else if (code in ANSI_BG_COLORS) {
          currentStyle['background-color'] = ANSI_BG_COLORS[code];
        }
      }
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.substring(lastIndex), style: { ...currentStyle } });
  }

  return segments.length > 0 ? segments : [{ text, style: {} }];
}

/**
 * Strip all ANSI escape sequences from text.
 */
export function stripAnsi(text: string): string {
  ANSI_REGEX.lastIndex = 0;
  return text.replace(ANSI_REGEX, '');
}
