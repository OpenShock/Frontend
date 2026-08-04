// userAgent.test.ts
import { describe, expect, it, test } from 'vitest';
import { getReadableUserAgentName } from './userAgent';

describe('getReadableUserAgentName', () => {
  describe('OpenShock-specific UAs', () => {
    const cases = [
      {
        ua: 'OpenShock/1.4.0 (arduino-esp32; Wemos-Lolin-S3; ESP32S3; Espressif)',
        expected: 'OpenShock 1.4.0 on Arduino ESP32S3',
      },
      {
        ua: 'OpenShock/0.0.0-local (arduino-esp32; Wemos-D1-Mini-ESP32; ESP32; Espressif)',
        expected: 'OpenShock 0.0.0-local on Arduino ESP32',
      },
      {
        ua: 'OpenShock/1.1.2 (arduino-esp32; OpenShock-Core-V2; ESP32S3; Espressif)',
        expected: 'OpenShock 1.1.2 on Arduino ESP32S3',
      },
    ];

    test.each(cases)('parses "$ua" correctly', ({ ua, expected }) => {
      expect(getReadableUserAgentName(ua)).toBe(expected);
    });
  });

  // Non-OpenShock UAs
  it('should parse Chrome on Windows 10 correctly', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/100.0.4896.127 Safari/537.36';
    const result = getReadableUserAgentName(ua);
    expect(result).toBe('Chrome on Windows 10');
  });

  // Edge cases
  it('should return null for an empty UA string', () => {
    expect(getReadableUserAgentName('')).toBeNull();
  });

  it('should return null when browser or OS cannot be determined', () => {
    // Using a deliberately unrecognized string
    const ua = 'SomeRandomUserAgent/1234';
    expect(getReadableUserAgentName(ua)).toBeNull();
  });
});

describe('getReadableUserAgentName — additional cases', () => {
  it('parses Firefox on Linux', () => {
    const ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0';
    expect(getReadableUserAgentName(ua)).toMatch(/^Firefox on Linux/);
  });

  it('parses Safari on macOS', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
    const result = getReadableUserAgentName(ua);
    expect(result).toMatch(/^Safari on macOS/);
  });

  it('parses Chrome Mobile on Android', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36';
    const result = getReadableUserAgentName(ua);
    expect(result).toMatch(/Android 13$/);
  });

  it('parses Edge on Windows 11', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
    const result = getReadableUserAgentName(ua);
    // ua-parser-js identifies as Edge
    expect(result).toMatch(/Edge/);
  });

  it('returns null for whitespace-only UA', () => {
    expect(getReadableUserAgentName('   ')).toBeNull();
  });

  it('returns null for an obviously bogus UA without OS info', () => {
    expect(getReadableUserAgentName('Foo/1.0')).toBeNull();
  });

  it('handles an OpenShock UA with C3 RISC-V CPU', () => {
    const ua = 'OpenShock/1.5.0 (arduino-esp32; Some-Board; ESP32C3; Espressif)';
    const result = getReadableUserAgentName(ua);
    expect(result).toMatch(/^OpenShock 1\.5\.0 on Arduino/);
  });

  it('handles an unrecognised OpenShock device gracefully', () => {
    // Doesn't match the device regex, so model stays undefined
    const ua = 'OpenShock/1.0.0 (something-weird)';
    const result = getReadableUserAgentName(ua);
    // Browser+OS may or may not parse; just ensure no throw
    expect(typeof result === 'string' || result === null).toBe(true);
  });

  it('does not throw on extremely long UA string', () => {
    const ua = 'Mozilla/5.0 ' + 'X'.repeat(5000);
    expect(() => getReadableUserAgentName(ua)).not.toThrow();
  });

  it('handles UA with non-ASCII characters', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; café) Chrome/100.0.0.0';
    expect(() => getReadableUserAgentName(ua)).not.toThrow();
  });
});
