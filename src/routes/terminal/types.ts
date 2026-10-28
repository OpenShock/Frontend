import type { AnsiSegment } from './ansi';

export type LogLevel = 'E' | 'W' | 'I' | 'D' | 'V';

/** Which log prefix format a line was parsed from. */
export type LogFormat = 'openshock' | 'espidf';

/** A console color slot: background, text, timestamp gutter, or one of the log levels. */
export type ColorKey = 'bg' | 'fg' | 'ts' | LogLevel;

export type Palette = Record<ColorKey, string>;

export type TimestampMode = 'uptime' | 'local' | 'ms' | 'off';

/** Console preferences as persisted and shared. */
export interface StoredSettings {
  timestampMode: TimestampMode;
  rawMode: boolean;
  hideSystem: boolean;
  stickToBottom: boolean;
  colors: Partial<Palette>;
}

export interface TerminalLine {
  id: number;
  text: string;
  timestamp: Temporal.Instant;
  segments: AnsiSegment[];
  logLevel: LogLevel | null;
  logFormat: LogFormat | null;
  deviceUptime: number | null;
  logTag: string | null;
}
