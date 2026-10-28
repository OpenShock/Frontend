import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from './constants';
import { decodeShareString, encodeShareString, parseStoredSettings } from './terminal-settings';
import type { StoredSettings } from './types';

const custom: StoredSettings = {
  timestampMode: 'local',
  rawMode: true,
  hideSystem: false,
  stickToBottom: true,
  colors: { bg: '#000000', fg: '#dedede', E: '#db0000' },
};

describe('parseStoredSettings', () => {
  it('returns defaults for non-objects', () => {
    expect(parseStoredSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(parseStoredSettings('nope')).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps valid fields and replaces invalid ones', () => {
    expect(
      parseStoredSettings({
        timestampMode: 'ms',
        rawMode: 'yes',
        hideSystem: false,
        colors: { bg: '#ABCDEF', fg: 'red', E: '#fff' },
      })
    ).toEqual({
      timestampMode: 'ms',
      rawMode: false,
      hideSystem: false,
      stickToBottom: true,
      colors: { bg: '#abcdef' },
    });
  });
});

describe('share string', () => {
  it('encodes with short keys, bits, and 2-digit greys', () => {
    expect(encodeShareString(custom)).toBe(
      '{"v":1,"t":"l","r":1,"h":0,"s":1,"c":{"bg":"00","fg":"de","E":"db0000"}}'
    );
  });

  it('round-trips', () => {
    expect(decodeShareString(encodeShareString(custom))).toEqual(custom);
    expect(decodeShareString(encodeShareString(DEFAULT_SETTINGS))).toEqual(DEFAULT_SETTINGS);
  });

  it('accepts booleans for bits and tolerates surrounding whitespace', () => {
    expect(decodeShareString('  {"t":"o","r":true,"h":false}\n')).toEqual({
      ...DEFAULT_SETTINGS,
      timestampMode: 'off',
      rawMode: true,
      hideSystem: false,
    });
  });

  it('drops colors that are not 2 or 6 hex digits', () => {
    expect(decodeShareString('{"c":{"bg":"abc","fg":"zz","E":"ff4444","W":12}}')?.colors).toEqual({
      E: '#ff4444',
    });
  });

  it('returns null for non-JSON and non-object JSON', () => {
    expect(decodeShareString('not json')).toBeNull();
    expect(decodeShareString('42')).toBeNull();
    expect(decodeShareString('null')).toBeNull();
  });
});
