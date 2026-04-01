import { describe, expect, it } from 'vitest';
import { parseAnsi, parseLogLine, stripAnsi } from './ansi';

describe('parseLogLine', () => {
  describe('OpenShock format: [uptimeMs][LEVEL][tag]', () => {
    it('parses error line', () => {
      const result = parseLogLine('[56984][E][Config.cpp:185] SaveFromJSON():');
      expect(result).toEqual({ logLevel: 'E', deviceUptime: 56984, tag: 'Config.cpp:185' });
    });

    it('parses warning line', () => {
      const result = parseLogLine('[1234][W][WiFi.cpp:42] connect(): timeout');
      expect(result).toEqual({ logLevel: 'W', deviceUptime: 1234, tag: 'WiFi.cpp:42' });
    });

    it('parses info line', () => {
      const result = parseLogLine('[500][I][Main.cpp:10] setup(): ready');
      expect(result).toEqual({ logLevel: 'I', deviceUptime: 500, tag: 'Main.cpp:10' });
    });

    it('parses debug line', () => {
      const result = parseLogLine('[99999][D][Serial.cpp:77] read(): got 12 bytes');
      expect(result).toEqual({ logLevel: 'D', deviceUptime: 99999, tag: 'Serial.cpp:77' });
    });

    it('parses verbose line', () => {
      const result = parseLogLine('[0][V][Boot.cpp:1] init():');
      expect(result).toEqual({ logLevel: 'V', deviceUptime: 0, tag: 'Boot.cpp:1' });
    });

    it('parses with leading ANSI escape', () => {
      const result = parseLogLine('\x1b[0;31m[56984][E][Config.cpp:185] SaveFromJSON():');
      expect(result).toEqual({ logLevel: 'E', deviceUptime: 56984, tag: 'Config.cpp:185' });
    });

    it('parses with multiple leading ANSI escapes', () => {
      const result = parseLogLine('\x1b[0m\x1b[1;33m[200][W][Net.cpp:5] warn():');
      expect(result).toEqual({ logLevel: 'W', deviceUptime: 200, tag: 'Net.cpp:5' });
    });
  });

  describe('ESP-IDF format: LEVEL (uptimeMs) TAG:', () => {
    it('parses error line', () => {
      const result = parseLogLine('E (12345) wifi: connection failed');
      expect(result).toEqual({ logLevel: 'E', deviceUptime: 12345, tag: 'wifi' });
    });

    it('parses warning line', () => {
      const result = parseLogLine('W (500) httpd_parse: some warning');
      expect(result).toEqual({ logLevel: 'W', deviceUptime: 500, tag: 'httpd_parse' });
    });

    it('parses info line', () => {
      const result = parseLogLine('I (3000) MAIN: started');
      expect(result).toEqual({ logLevel: 'I', deviceUptime: 3000, tag: 'MAIN' });
    });

    it('parses debug line', () => {
      const result = parseLogLine('D (100) spi_flash: read 4096 bytes');
      expect(result).toEqual({ logLevel: 'D', deviceUptime: 100, tag: 'spi_flash' });
    });

    it('parses verbose line', () => {
      const result = parseLogLine('V (0) boot: init complete');
      expect(result).toEqual({ logLevel: 'V', deviceUptime: 0, tag: 'boot' });
    });

    it('parses with leading ANSI escape', () => {
      const result = parseLogLine('\x1b[0;32mI (12345) wifi: connected');
      expect(result).toEqual({ logLevel: 'I', deviceUptime: 12345, tag: 'wifi' });
    });
  });

  describe('non-matching lines', () => {
    it('returns null for plain text', () => {
      expect(parseLogLine('hello world')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(parseLogLine('')).toBeNull();
    });

    it('returns null for bootloader output', () => {
      expect(parseLogLine('rst:0x1 (POWERON_RESET),boot:0x13')).toBeNull();
    });

    it('returns null for bare ANSI', () => {
      expect(parseLogLine('\x1b[0msome text')).toBeNull();
    });
  });

  it('prefers OpenShock format over ESP-IDF', () => {
    // A line that could only match OpenShock format
    const result = parseLogLine('[100][I][tag] msg');
    expect(result).toEqual({ logLevel: 'I', deviceUptime: 100, tag: 'tag' });
  });
});

describe('parseAnsi', () => {
  it('returns plain text as single unstyled segment', () => {
    const result = parseAnsi('hello world');
    expect(result).toEqual([{ text: 'hello world', style: {} }]);
  });

  it('returns empty text as single unstyled segment', () => {
    const result = parseAnsi('');
    expect(result).toEqual([{ text: '', style: {} }]);
  });

  it('parses foreground color', () => {
    const result = parseAnsi('\x1b[31mred text');
    expect(result).toEqual([{ text: 'red text', style: { color: '#ff0000' } }]);
  });

  it('parses background color', () => {
    const result = parseAnsi('\x1b[42mgreen bg');
    expect(result).toEqual([{ text: 'green bg', style: { 'background-color': '#00ff00' } }]);
  });

  it('parses bold', () => {
    const result = parseAnsi('\x1b[1mbold text');
    expect(result).toEqual([{ text: 'bold text', style: { 'font-weight': 'bold' } }]);
  });

  it('parses italic', () => {
    const result = parseAnsi('\x1b[3mitalic text');
    expect(result).toEqual([{ text: 'italic text', style: { 'font-style': 'italic' } }]);
  });

  it('parses underline', () => {
    const result = parseAnsi('\x1b[4munderlined');
    expect(result).toEqual([{ text: 'underlined', style: { 'text-decoration': 'underline' } }]);
  });

  it('resets style on code 0', () => {
    const result = parseAnsi('\x1b[31mred\x1b[0m normal');
    expect(result).toEqual([
      { text: 'red', style: { color: '#ff0000' } },
      { text: ' normal', style: {} },
    ]);
  });

  it('handles combined codes in single sequence', () => {
    const result = parseAnsi('\x1b[1;31mbold red');
    expect(result).toEqual([
      { text: 'bold red', style: { 'font-weight': 'bold', color: '#ff0000' } },
    ]);
  });

  it('handles multiple segments with different colors', () => {
    const result = parseAnsi('\x1b[31mred\x1b[32mgreen\x1b[34mblue');
    expect(result).toEqual([
      { text: 'red', style: { color: '#ff0000' } },
      { text: 'green', style: { color: '#00ff00' } },
      { text: 'blue', style: { color: '#0000ff' } },
    ]);
  });

  it('handles text before first escape', () => {
    const result = parseAnsi('prefix \x1b[31mred');
    expect(result).toEqual([
      { text: 'prefix ', style: {} },
      { text: 'red', style: { color: '#ff0000' } },
    ]);
  });

  it('parses bright colors', () => {
    const result = parseAnsi('\x1b[91mbright red');
    expect(result).toEqual([{ text: 'bright red', style: { color: '#ff6b6b' } }]);
  });

  it('removes bold with code 22', () => {
    const result = parseAnsi('\x1b[1mbold\x1b[22mnot bold');
    expect(result).toEqual([
      { text: 'bold', style: { 'font-weight': 'bold' } },
      { text: 'not bold', style: {} },
    ]);
  });

  it('handles bare reset sequence', () => {
    const result = parseAnsi('\x1b[mtext');
    expect(result).toEqual([{ text: 'text', style: {} }]);
  });

  it('ignores non-SGR sequences', () => {
    // \x1b[2J is a clear screen command (not 'm'), should be skipped
    const result = parseAnsi('\x1b[2Jhello');
    expect(result).toEqual([{ text: 'hello', style: {} }]);
  });
});

describe('stripAnsi', () => {
  it('returns plain text unchanged', () => {
    expect(stripAnsi('hello world')).toBe('hello world');
  });

  it('strips single escape', () => {
    expect(stripAnsi('\x1b[31mred text')).toBe('red text');
  });

  it('strips multiple escapes', () => {
    expect(stripAnsi('\x1b[1;31mbold red\x1b[0m normal')).toBe('bold red normal');
  });

  it('strips from OpenShock log line', () => {
    expect(stripAnsi('\x1b[0;31m[56984][E][Config.cpp:185] SaveFromJSON():\x1b[0m')).toBe(
      '[56984][E][Config.cpp:185] SaveFromJSON():',
    );
  });

  it('returns empty string unchanged', () => {
    expect(stripAnsi('')).toBe('');
  });
});
