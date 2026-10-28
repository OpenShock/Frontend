import type { IEspLoaderTerminal } from 'esptool-js';
import { parseAnsi, parseLogLine, reorderOpenShockScopes } from './ansi';
import { MAX_LINES } from './constants';
import type { TerminalLine } from './types';

/**
 * Reactive terminal state. Implements IEspLoaderTerminal so it can be handed
 * directly to EspSerialConnection for both application logs and esptool output.
 */
export class TerminalContext implements IEspLoaderTerminal {
  lines = $state<TerminalLine[]>([]);
  #lineIdCounter = 0;

  #message(text: string, parsed: ReturnType<typeof parseLogLine>): string {
    if (!parsed) return text;
    const message = text.substring(parsed.messageOffset);
    return parsed.format === 'openshock' ? reorderOpenShockScopes(message) : message;
  }

  #makeLine(text: string, timestamp?: Temporal.Instant): TerminalLine {
    const parsed = parseLogLine(text);
    const message = this.#message(text, parsed);
    return {
      id: this.#lineIdCounter++,
      text,
      timestamp: timestamp ?? Temporal.Now.instant(),
      segments: parseAnsi(message),
      logLevel: parsed?.logLevel ?? null,
      logFormat: parsed?.format ?? null,
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
    const message = this.#message(newText, parsed);
    this.lines[this.lines.length - 1] = {
      ...last,
      text: newText,
      segments: parseAnsi(message),
      logLevel: parsed?.logLevel ?? null,
      logFormat: parsed?.format ?? null,
      deviceUptime: parsed?.deviceUptime ?? null,
      logTag: parsed?.tag ?? null,
    };
  };
}
