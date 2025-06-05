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
