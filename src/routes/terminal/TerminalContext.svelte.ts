import type { IEspLoaderTerminal } from 'esptool-js';
import { parseAnsi, parseLogLine } from './ansi';
import { MAX_LINES } from './constants';
import type { TerminalLine } from './types';

/**
 * Reactive terminal state. Implements IEspLoaderTerminal so it can be handed
 * directly to EspSerialConnection for both application logs and esptool output.
 */
export class TerminalContext implements IEspLoaderTerminal {
  lines = $state<TerminalLine[]>([]);
  #lineIdCounter = 0;

  #makeLine(text: string, timestamp?: Date): TerminalLine {
    const parsed = parseLogLine(text);
    const message = parsed ? text.substring(parsed.messageOffset) : text;
    return {
      id: this.#lineIdCounter++,
      text,
      timestamp: timestamp ?? new Date(),
      segments: parseAnsi(message),
      logLevel: parsed?.logLevel ?? null,
      deviceUptime: parsed?.deviceUptime ?? null,
      logTag: parsed?.tag ?? null,
    };
  }

  clean = () => {
    this.lines = [];
  };

  writeLine = (data: string) => {
    this.lines.push(this.#makeLine(data));
    if (this.lines.length > MAX_LINES) {
      this.lines.splice(0, this.lines.length - MAX_LINES);
    }
  };

  write = (data: string) => {
    if (this.lines.length === 0) {
      this.lines.push(this.#makeLine(data));
      return;
    }
    const last = this.lines[this.lines.length - 1];
    const newText = last.text + data;
    const parsed = parseLogLine(newText);
    const message = parsed ? newText.substring(parsed.messageOffset) : newText;
    this.lines[this.lines.length - 1] = {
      ...last,
      text: newText,
      segments: parseAnsi(message),
      logLevel: parsed?.logLevel ?? null,
      deviceUptime: parsed?.deviceUptime ?? null,
      logTag: parsed?.tag ?? null,
    };
  };
}
