import type { AnsiSegment } from './ansi';

export type LogLevel = 'E' | 'W' | 'I' | 'D' | 'V';

export interface TerminalLine {
  id: number;
  text: string;
  timestamp: Date;
  segments: AnsiSegment[];
  logLevel: LogLevel | null;
  deviceUptime: number | null;
  logTag: string | null;
}
