import { DARK_PALETTE, DEFAULT_SETTINGS, HEX_COLOR, LIGHT_PALETTE } from './constants';
import { decodeShareString, encodeShareString, parseStoredSettings } from './terminal-settings';
import type { ColorKey, Palette, StoredSettings, TimestampMode } from './types';

const STORAGE_KEY = 'openshock:serial-terminal';

function load(): StoredSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return parseStoredSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Reactive, persisted serial terminal preferences.
 * Colors are stored only when the user overrides them; everything else falls back to the theme palette.
 */
export class TerminalSettings {
  timestampMode = $state<TimestampMode>(DEFAULT_SETTINGS.timestampMode);
  rawMode = $state(DEFAULT_SETTINGS.rawMode);
  hideSystem = $state(DEFAULT_SETTINGS.hideSystem);
  stickToBottom = $state(DEFAULT_SETTINGS.stickToBottom);
  colors = $state<Partial<Palette>>({});

  constructor() {
    this.#apply(load());
  }

  get hasCustomColors(): boolean {
    return Object.keys(this.colors).length > 0;
  }

  setColor(key: ColorKey, value: string) {
    if (!HEX_COLOR.test(value)) return;
    this.colors = { ...this.colors, [key]: value.toLowerCase() };
  }

  resetColors() {
    this.colors = {};
  }

  /** The palette in effect for the given theme, with user overrides applied. */
  effectivePalette(dark: boolean): Palette {
    return { ...(dark ? DARK_PALETTE : LIGHT_PALETTE), ...this.colors };
  }

  /** Serializes all settings as a compact JSON string for sharing. */
  exportString(): string {
    return encodeShareString(this.#snapshot());
  }

  /** Applies settings from a string made by exportString. Returns false if it could not be read. */
  importString(text: string): boolean {
    const parsed = decodeShareString(text);
    if (!parsed) return false;
    this.#apply(parsed);
    return true;
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.#snapshot()));
    } catch {
      // Storage can be unavailable (private mode, quota, blocked).
    }
  }

  #apply(s: StoredSettings) {
    this.timestampMode = s.timestampMode;
    this.rawMode = s.rawMode;
    this.hideSystem = s.hideSystem;
    this.stickToBottom = s.stickToBottom;
    this.colors = s.colors;
  }

  #snapshot(): StoredSettings {
    return {
      timestampMode: this.timestampMode,
      rawMode: this.rawMode,
      hideSystem: this.hideSystem,
      stickToBottom: this.stickToBottom,
      colors: this.colors,
    };
  }
}
