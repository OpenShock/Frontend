import { describe, expect, it } from 'vitest';
import { parseAnsi, parseLogLine, stripAnsi } from './ansi';

describe('parseLogLine', () => {
  describe('OpenShock format: [uptimeMs][LEVEL][tag]', () => {
    it('parses error line', () => {
      const result = parseLogLine('[56984][E][Config.cpp:185] SaveFromJSON():');
      expect(result).toEqual({
        logLevel: 'E',
        deviceUptime: 56984,
        tag: 'Config.cpp:185',
        messageOffset: 27,
      });
    });

    it('parses warning line', () => {
      const result = parseLogLine('[1234][W][WiFi.cpp:42] connect(): timeout');
      expect(result).toEqual({
        logLevel: 'W',
        deviceUptime: 1234,
        tag: 'WiFi.cpp:42',
        messageOffset: 23,
      });
    });

    it('parses info line', () => {
      const result = parseLogLine('[500][I][Main.cpp:10] setup(): ready');
      expect(result).toEqual({
        logLevel: 'I',
        deviceUptime: 500,
        tag: 'Main.cpp:10',
        messageOffset: 22,
      });
    });

    it('parses debug line', () => {
      const result = parseLogLine('[99999][D][Serial.cpp:77] read(): got 12 bytes');
      expect(result).toEqual({
        logLevel: 'D',
        deviceUptime: 99999,
        tag: 'Serial.cpp:77',
        messageOffset: 26,
      });
    });

    it('parses verbose line', () => {
      const result = parseLogLine('[0][V][Boot.cpp:1] init():');
      expect(result).toEqual({
        logLevel: 'V',
        deviceUptime: 0,
        tag: 'Boot.cpp:1',
        messageOffset: 19,
      });
    });

    it('parses with leading ANSI escape', () => {
      const result = parseLogLine('\x1b[0;31m[56984][E][Config.cpp:185] SaveFromJSON():');
      expect(result).toEqual({
        logLevel: 'E',
        deviceUptime: 56984,
        tag: 'Config.cpp:185',
        messageOffset: 34,
      });
    });

    it('parses with multiple leading ANSI escapes', () => {
      const result = parseLogLine('\x1b[0m\x1b[1;33m[200][W][Net.cpp:5] warn():');
      expect(result).toEqual({
        logLevel: 'W',
        deviceUptime: 200,
        tag: 'Net.cpp:5',
        messageOffset: 31,
      });
    });

    it('parses space-padded uptime', () => {
      const result = parseLogLine('[ 56464][V][ssl_client.cpp:369] some message');
      expect(result).toEqual({
        logLevel: 'V',
        deviceUptime: 56464,
        tag: 'ssl_client.cpp:369',
        messageOffset: 32,
      });
    });
  });

  describe('ESP-IDF format: LEVEL (uptimeMs) TAG:', () => {
    it('parses error line', () => {
      const result = parseLogLine('E (12345) wifi: connection failed');
      expect(result).toEqual({
        logLevel: 'E',
        deviceUptime: 12345,
        tag: 'wifi',
        messageOffset: 16,
      });
    });

    it('parses warning line', () => {
      const result = parseLogLine('W (500) httpd_parse: some warning');
      expect(result).toEqual({
        logLevel: 'W',
        deviceUptime: 500,
        tag: 'httpd_parse',
        messageOffset: 21,
      });
    });

    it('parses info line', () => {
      const result = parseLogLine('I (3000) MAIN: started');
      expect(result).toEqual({ logLevel: 'I', deviceUptime: 3000, tag: 'MAIN', messageOffset: 15 });
    });

    it('parses debug line', () => {
      const result = parseLogLine('D (100) spi_flash: read 4096 bytes');
      expect(result).toEqual({
        logLevel: 'D',
        deviceUptime: 100,
        tag: 'spi_flash',
        messageOffset: 19,
      });
    });

    it('parses verbose line', () => {
      const result = parseLogLine('V (0) boot: init complete');
      expect(result).toEqual({ logLevel: 'V', deviceUptime: 0, tag: 'boot', messageOffset: 12 });
    });

    it('parses with leading ANSI escape', () => {
      const result = parseLogLine('\x1b[0;32mI (12345) wifi: connected');
      expect(result).toEqual({
        logLevel: 'I',
        deviceUptime: 12345,
        tag: 'wifi',
        messageOffset: 23,
      });
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
    expect(result).toEqual({ logLevel: 'I', deviceUptime: 100, tag: 'tag', messageOffset: 14 });
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
      '[56984][E][Config.cpp:185] SaveFromJSON():'
    );
  });

  it('returns empty string unchanged', () => {
    expect(stripAnsi('')).toBe('');
  });
});

describe('parseAnsi - SGR foreground colors', () => {
  const fg: Array<[number, string, string]> = [
    [30, '#000000', 'black'],
    [31, '#ff0000', 'red'],
    [32, '#00ff00', 'green'],
    [33, '#ffff00', 'yellow'],
    [34, '#0000ff', 'blue'],
    [35, '#ff00ff', 'magenta'],
    [36, '#00ffff', 'cyan'],
    [37, '#ffffff', 'white'],
  ];
  for (const [code, hex, name] of fg) {
    it(`parses standard fg ${code} (${name})`, () => {
      const result = parseAnsi(`\x1b[${code}m${name}`);
      expect(result).toEqual([{ text: name, style: { color: hex } }]);
    });
  }

  const bright: Array<[number, string, string]> = [
    [90, '#808080', 'br-black'],
    [91, '#ff6b6b', 'br-red'],
    [92, '#51cf66', 'br-green'],
    [93, '#ffd93d', 'br-yellow'],
    [94, '#74c0fc', 'br-blue'],
    [95, '#ff8ed4', 'br-magenta'],
    [96, '#35d9d2', 'br-cyan'],
    [97, '#ffffff', 'br-white'],
  ];
  for (const [code, hex, name] of bright) {
    it(`parses bright fg ${code} (${name})`, () => {
      const result = parseAnsi(`\x1b[${code}m${name}`);
      expect(result).toEqual([{ text: name, style: { color: hex } }]);
    });
  }
});

describe('parseAnsi - SGR background colors', () => {
  const bg: Array<[number, string, string]> = [
    [40, '#000000', 'bg-black'],
    [41, '#ff0000', 'bg-red'],
    [42, '#00ff00', 'bg-green'],
    [43, '#ffff00', 'bg-yellow'],
    [44, '#0000ff', 'bg-blue'],
    [45, '#ff00ff', 'bg-magenta'],
    [46, '#00ffff', 'bg-cyan'],
    [47, '#ffffff', 'bg-white'],
  ];
  for (const [code, hex, name] of bg) {
    it(`parses standard bg ${code} (${name})`, () => {
      const result = parseAnsi(`\x1b[${code}m${name}`);
      expect(result).toEqual([{ text: name, style: { 'background-color': hex } }]);
    });
  }

  const bbg: Array<[number, string, string]> = [
    [100, '#808080', 'bbg-black'],
    [101, '#ff6b6b', 'bbg-red'],
    [102, '#51cf66', 'bbg-green'],
    [103, '#ffd93d', 'bbg-yellow'],
    [104, '#74c0fc', 'bbg-blue'],
    [105, '#ff8ed4', 'bbg-magenta'],
    [106, '#35d9d2', 'bbg-cyan'],
    [107, '#ffffff', 'bbg-white'],
  ];
  for (const [code, hex, name] of bbg) {
    it(`parses bright bg ${code} (${name})`, () => {
      const result = parseAnsi(`\x1b[${code}m${name}`);
      expect(result).toEqual([{ text: name, style: { 'background-color': hex } }]);
    });
  }
});

describe('parseAnsi - SGR text attributes', () => {
  it('removes italic with code 23', () => {
    const result = parseAnsi('\x1b[3mitalic\x1b[23mnormal');
    expect(result).toEqual([
      { text: 'italic', style: { 'font-style': 'italic' } },
      { text: 'normal', style: {} },
    ]);
  });

  it('removes underline with code 24', () => {
    const result = parseAnsi('\x1b[4munder\x1b[24mnormal');
    expect(result).toEqual([
      { text: 'under', style: { 'text-decoration': 'underline' } },
      { text: 'normal', style: {} },
    ]);
  });

  it('combines bold + italic + underline', () => {
    const result = parseAnsi('\x1b[1;3;4mall');
    expect(result).toEqual([
      {
        text: 'all',
        style: {
          'font-weight': 'bold',
          'font-style': 'italic',
          'text-decoration': 'underline',
        },
      },
    ]);
  });

  it('removes only bold while keeping italic', () => {
    const result = parseAnsi('\x1b[1;3mboth\x1b[22monly italic');
    expect(result).toEqual([
      { text: 'both', style: { 'font-weight': 'bold', 'font-style': 'italic' } },
      { text: 'only italic', style: { 'font-style': 'italic' } },
    ]);
  });

  it('code 22 on plain text is a no-op', () => {
    const result = parseAnsi('\x1b[22mhello');
    expect(result).toEqual([{ text: 'hello', style: {} }]);
  });
});

describe('parseAnsi - combined SGR codes', () => {
  it('combines fg color + bg color in single sequence', () => {
    const result = parseAnsi('\x1b[31;42mtext');
    expect(result).toEqual([
      { text: 'text', style: { color: '#ff0000', 'background-color': '#00ff00' } },
    ]);
  });

  it('combines bold + bright fg + bg', () => {
    const result = parseAnsi('\x1b[1;91;44mtext');
    expect(result).toEqual([
      {
        text: 'text',
        style: { 'font-weight': 'bold', color: '#ff6b6b', 'background-color': '#0000ff' },
      },
    ]);
  });

  it('later color in the same sequence overwrites earlier', () => {
    const result = parseAnsi('\x1b[31;32mtext');
    expect(result).toEqual([{ text: 'text', style: { color: '#00ff00' } }]);
  });

  it('reset embedded with subsequent codes clears then applies', () => {
    const result = parseAnsi('\x1b[1;31mone\x1b[0;32mtwo');
    expect(result).toEqual([
      { text: 'one', style: { 'font-weight': 'bold', color: '#ff0000' } },
      { text: 'two', style: { color: '#00ff00' } },
    ]);
  });
});

describe('parseAnsi - reset behavior', () => {
  it('reset clears all attributes', () => {
    const result = parseAnsi('\x1b[1;3;4;31;42mfancy\x1b[0mplain');
    expect(result).toEqual([
      {
        text: 'fancy',
        style: {
          'font-weight': 'bold',
          'font-style': 'italic',
          'text-decoration': 'underline',
          color: '#ff0000',
          'background-color': '#00ff00',
        },
      },
      { text: 'plain', style: {} },
    ]);
  });

  it('empty params default to reset (code 0)', () => {
    const result = parseAnsi('\x1b[31mred\x1b[mafter');
    expect(result).toEqual([
      { text: 'red', style: { color: '#ff0000' } },
      { text: 'after', style: {} },
    ]);
  });

  it('multiple consecutive resets are idempotent', () => {
    const result = parseAnsi('\x1b[31mred\x1b[0m\x1b[0m\x1b[0mplain');
    expect(result).toEqual([
      { text: 'red', style: { color: '#ff0000' } },
      { text: 'plain', style: {} },
    ]);
  });
});

describe('parseAnsi - 256-color and RGB extensions are not supported', () => {
  it('38;5;208 (256-color fg) is treated as separate codes and ignored', () => {
    const result = parseAnsi('\x1b[38;5;208mtext');
    expect(result).toEqual([{ text: 'text', style: {} }]);
  });

  it('48;5;100 (256-color bg) - sub-codes that collide with palette numbers leak through', () => {
    // 48 unknown, 5 unknown, 100 is bright black bg in ANSI_BG_COLORS.
    // Documents that the parser does not understand the 256-color framing.
    const result = parseAnsi('\x1b[48;5;100mtext');
    expect(result).toEqual([{ text: 'text', style: { 'background-color': '#808080' } }]);
  });

  it('38;2;r;g;b (RGB fg) - r/g/b values that match palette codes leak through', () => {
    // 38, 2 unknown; 255, 128 unknown; 0 triggers reset.
    const result = parseAnsi('\x1b[38;2;255;128;0mtext');
    expect(result).toEqual([{ text: 'text', style: {} }]);
  });

  it('48;2;r;g;b (RGB bg) - matching channel byte (30 = black fg) leaks through', () => {
    // 48, 2, 10, 20 all unknown; 30 is black fg in ANSI_COLORS.
    const result = parseAnsi('\x1b[48;2;10;20;30mtext');
    expect(result).toEqual([{ text: 'text', style: { color: '#000000' } }]);
  });

  it('38;2 with all out-of-palette channels yields no style', () => {
    const result = parseAnsi('\x1b[38;2;200;201;202mtext');
    expect(result).toEqual([{ text: 'text', style: {} }]);
  });

  it('extension after a real color keeps the real color applied', () => {
    const result = parseAnsi('\x1b[31;38;5;208mtext');
    expect(result).toEqual([{ text: 'text', style: { color: '#ff0000' } }]);
  });
});

describe('parseAnsi - cursor / non-SGR CSI sequences', () => {
  it('CUP (cursor position) H is consumed without styling', () => {
    const result = parseAnsi('\x1b[10;20Htext');
    expect(result).toEqual([{ text: 'text', style: {} }]);
  });

  it('CUU (cursor up) A is consumed', () => {
    const result = parseAnsi('before\x1b[5Aafter');
    expect(result).toEqual([
      { text: 'before', style: {} },
      { text: 'after', style: {} },
    ]);
  });

  it('CUD (cursor down) B is consumed', () => {
    const result = parseAnsi('\x1b[3Btext');
    expect(result).toEqual([{ text: 'text', style: {} }]);
  });

  it('CUF (cursor forward) C is consumed', () => {
    const result = parseAnsi('\x1b[2Ctext');
    expect(result).toEqual([{ text: 'text', style: {} }]);
  });

  it('CUB (cursor back) D is consumed', () => {
    const result = parseAnsi('\x1b[4Dtext');
    expect(result).toEqual([{ text: 'text', style: {} }]);
  });

  it('CHA (cursor horizontal absolute) G is consumed', () => {
    const result = parseAnsi('\x1b[10Gtext');
    expect(result).toEqual([{ text: 'text', style: {} }]);
  });

  it('ED (erase display) J is consumed', () => {
    const result = parseAnsi('\x1b[2Jcleared');
    expect(result).toEqual([{ text: 'cleared', style: {} }]);
  });

  it('EL (erase line) K is consumed', () => {
    const result = parseAnsi('\x1b[Kafter');
    expect(result).toEqual([{ text: 'after', style: {} }]);
  });

  it('non-SGR sequences do not affect existing style', () => {
    const result = parseAnsi('\x1b[31mred\x1b[2Jstill red');
    expect(result).toEqual([
      { text: 'red', style: { color: '#ff0000' } },
      { text: 'still red', style: { color: '#ff0000' } },
    ]);
  });

  it('unknown final byte (lowercase) is consumed', () => {
    const result = parseAnsi('\x1b[5xhello');
    expect(result).toEqual([{ text: 'hello', style: {} }]);
  });

  it('unknown final byte (uppercase) is consumed', () => {
    const result = parseAnsi('\x1b[1Zhello');
    expect(result).toEqual([{ text: 'hello', style: {} }]);
  });
});

describe('parseAnsi - malformed sequences', () => {
  it('lone ESC is preserved as literal text', () => {
    const result = parseAnsi('\x1b');
    expect(result).toEqual([{ text: '\x1b', style: {} }]);
  });

  it('ESC followed by [ but no terminator is preserved', () => {
    const result = parseAnsi('\x1b[');
    expect(result).toEqual([{ text: '\x1b[', style: {} }]);
  });

  it('ESC + [ + digits without terminator is preserved', () => {
    const result = parseAnsi('\x1b[31');
    expect(result).toEqual([{ text: '\x1b[31', style: {} }]);
  });

  it('lone ESC before a valid sequence is kept literal', () => {
    const result = parseAnsi('\x1b\x1b[31mred');
    expect(result).toEqual([
      { text: '\x1b', style: {} },
      { text: 'red', style: { color: '#ff0000' } },
    ]);
  });

  it('ESC without [ followed by text leaves it literal', () => {
    const result = parseAnsi('\x1bXhello');
    expect(result).toEqual([{ text: '\x1bXhello', style: {} }]);
  });

  it('only an incomplete CSI yields the original text', () => {
    const result = parseAnsi('\x1b[;;;');
    expect(result).toEqual([{ text: '\x1b[;;;', style: {} }]);
  });
});

describe('parseAnsi - mixed text and escapes', () => {
  it('text before, between, and after sequences', () => {
    const result = parseAnsi('start \x1b[31mred\x1b[0m middle \x1b[32mgreen\x1b[0m end');
    expect(result).toEqual([
      { text: 'start ', style: {} },
      { text: 'red', style: { color: '#ff0000' } },
      { text: ' middle ', style: {} },
      { text: 'green', style: { color: '#00ff00' } },
      { text: ' end', style: {} },
    ]);
  });

  it('back-to-back sequences with no text between produce no empty segment', () => {
    const result = parseAnsi('\x1b[31m\x1b[1mred-bold');
    expect(result).toEqual([
      { text: 'red-bold', style: { color: '#ff0000', 'font-weight': 'bold' } },
    ]);
  });

  it('trailing escape with no text after still yields prior segment', () => {
    const result = parseAnsi('\x1b[31mred\x1b[0m');
    expect(result).toEqual([{ text: 'red', style: { color: '#ff0000' } }]);
  });

  it('leading escape only is parsed but yields no segments => fallback', () => {
    const result = parseAnsi('\x1b[31m');
    // Regex matched once, no text on either side; segments array is empty so fallback applies.
    expect(result).toEqual([{ text: '\x1b[31m', style: {} }]);
  });
});

describe('parseAnsi - control characters and unicode', () => {
  it('preserves \\r in text', () => {
    const result = parseAnsi('line1\rline2');
    expect(result).toEqual([{ text: 'line1\rline2', style: {} }]);
  });

  it('preserves \\n in text', () => {
    const result = parseAnsi('line1\nline2');
    expect(result).toEqual([{ text: 'line1\nline2', style: {} }]);
  });

  it('preserves \\t in text', () => {
    const result = parseAnsi('a\tb');
    expect(result).toEqual([{ text: 'a\tb', style: {} }]);
  });

  it('preserves BEL (\\x07) in text', () => {
    const result = parseAnsi('beep\x07!');
    expect(result).toEqual([{ text: 'beep\x07!', style: {} }]);
  });

  it('preserves backspace (\\b) in text', () => {
    const result = parseAnsi('ab\bc');
    expect(result).toEqual([{ text: 'ab\bc', style: {} }]);
  });

  it('preserves control chars across styled segments', () => {
    const result = parseAnsi('\x1b[31ma\tb\x1b[0mc\nd');
    expect(result).toEqual([
      { text: 'a\tb', style: { color: '#ff0000' } },
      { text: 'c\nd', style: {} },
    ]);
  });

  it('handles BMP unicode characters in text', () => {
    const result = parseAnsi('\x1b[31mhello é 中文');
    expect(result).toEqual([{ text: 'hello é 中文', style: { color: '#ff0000' } }]);
  });

  it('handles emoji (surrogate pairs) in text', () => {
    const result = parseAnsi('\x1b[32mready 🚀 go');
    expect(result).toEqual([{ text: 'ready 🚀 go', style: { color: '#00ff00' } }]);
  });

  it('handles zero-width and combining characters', () => {
    const result = parseAnsi('á​b');
    expect(result).toEqual([{ text: 'á​b', style: {} }]);
  });
});

describe('parseAnsi - large input and stability', () => {
  it('handles input larger than 10KB without losing text', () => {
    const chunk = 'lorem ipsum dolor sit amet, consectetur adipiscing elit. ';
    let input = '';
    while (input.length < 11000) input += chunk;
    const result = parseAnsi(input);
    expect(result).toEqual([{ text: input, style: {} }]);
  });

  it('handles many alternating styled segments', () => {
    const parts: string[] = [];
    for (let i = 0; i < 500; i++) {
      parts.push(`\x1b[${i % 2 === 0 ? 31 : 32}mx${i}\x1b[0m`);
    }
    const result = parseAnsi(parts.join(''));
    // Back-to-back escapes (reset followed immediately by next color) produce no
    // empty intermediate segment, so we get one segment per styled chunk.
    expect(result).toHaveLength(500);
    expect(result[0]).toEqual({ text: 'x0', style: { color: '#ff0000' } });
    expect(result[1]).toEqual({ text: 'x1', style: { color: '#00ff00' } });
    expect(result[result.length - 1]).toEqual({
      text: 'x499',
      style: { color: '#00ff00' },
    });
  });

  it('repeated invocations are independent (no shared regex state leak)', () => {
    const a = parseAnsi('\x1b[31mred');
    const b = parseAnsi('\x1b[32mgreen');
    const c = parseAnsi('\x1b[31mred');
    expect(a).toEqual([{ text: 'red', style: { color: '#ff0000' } }]);
    expect(b).toEqual([{ text: 'green', style: { color: '#00ff00' } }]);
    expect(c).toEqual(a);
  });

  it('returned style objects do not share references between segments', () => {
    const result = parseAnsi('\x1b[31mred\x1b[0mplain');
    expect(result).toHaveLength(2);
    result[0].style['color'] = 'mutated';
    expect(result[1].style).toEqual({});
  });
});

describe('stripAnsi - additional cases', () => {
  it('strips cursor movement sequences', () => {
    expect(stripAnsi('a\x1b[10;20Hb\x1b[2Jc\x1b[Kd')).toBe('abcd');
  });

  it('leaves lone ESC untouched', () => {
    expect(stripAnsi('foo\x1bbar')).toBe('foo\x1bbar');
  });

  it('leaves incomplete CSI (no terminator letter) untouched', () => {
    expect(stripAnsi('foo\x1b[123;456')).toBe('foo\x1b[123;456');
  });

  it('strips bare reset \\x1b[m', () => {
    expect(stripAnsi('a\x1b[mb')).toBe('ab');
  });

  it('strips many sequences in a long string', () => {
    let input = '';
    let expected = '';
    for (let i = 0; i < 200; i++) {
      input += `\x1b[31mhello\x1b[0m `;
      expected += 'hello ';
    }
    expect(stripAnsi(input)).toBe(expected);
  });

  it('preserves unicode and control chars while stripping escapes', () => {
    expect(stripAnsi('\x1b[31m中文\t🚀\x1b[0m')).toBe('中文\t🚀');
  });

  it('repeated calls remain consistent (no regex state leak)', () => {
    const s = '\x1b[31mred\x1b[0m';
    expect(stripAnsi(s)).toBe('red');
    expect(stripAnsi(s)).toBe('red');
    expect(stripAnsi(s)).toBe('red');
  });
});
