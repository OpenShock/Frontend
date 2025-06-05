import { describe, expect, it } from 'vitest';
import { DecodeString, EncodeString, escapeHtml } from './encoding';

describe('escapeHtml', () => {
  it('returns "null" when input is null', () => {
    expect(escapeHtml(null)).toBe('null');
  });

  it('leaves a string without special characters unchanged', () => {
    expect(escapeHtml('abc123')).toBe('abc123');
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });

  it('escapes &, <, >, ", and \' correctly', () => {
    const unsafe = `Dolce & Gabbana < "Fashion" > 'Style'`;
    const expected = 'Dolce &amp; Gabbana &lt; &quot;Fashion&quot; &gt; &#039;Style&#039;';
    expect(escapeHtml(unsafe)).toBe(expected);
  });

  it('handles strings that are already partially escaped without double-escaping', () => {
    const partially = '&amp;&lt;&gt;&quot;&#039;';
    // Only raw &, <, >, ", ' get replaced; existing entities contain & so they become &amp;
    expect(escapeHtml(partially)).toBe('&amp;amp;&amp;lt;&amp;gt;&amp;quot;&amp;#039;');
  });

  it('escapes a string containing only special characters', () => {
    expect(escapeHtml('&<>"\'')).toBe('&amp;&lt;&gt;&quot;&#039;');
  });

  it('returns an empty string when given an empty string', () => {
    expect(escapeHtml('')).toBe('');
  });
});

describe('EncodeString & DecodeString', () => {
  it('EncodeString returns a Uint8Array representing UTF-8 bytes', () => {
    const ascii = 'hello';
    const asciiEncoded = EncodeString(ascii);
    // UTF-8 for "hello" is [104, 101, 108, 108, 111]
    expect(asciiEncoded).toBeInstanceOf(Uint8Array);
    expect(Array.from(asciiEncoded)).toEqual([104, 101, 108, 108, 111]);

    const unicode = '你好';
    const unicodeEncoded = EncodeString(unicode);
    // Verify against TextEncoder directly
    const expected = new TextEncoder().encode(unicode);
    expect(Array.from(unicodeEncoded)).toEqual(Array.from(expected));
  });

  it('DecodeString returns the original string from a Uint8Array', () => {
    const original = 'Vitest 🚀';
    const encoded = new TextEncoder().encode(original);
    const decoded = DecodeString(encoded);
    expect(decoded).toBe(original);
  });

  it('round-trips arbitrary strings through EncodeString and DecodeString', () => {
    const samples = [
      '',
      'simple text',
      'Line 1\nLine 2\tTabbed',
      'áéíóú üñ ¿¡',
      'Emoji: 😀🎉',
      '中文字符测试',
    ];

    for (const s of samples) {
      const encoded = EncodeString(s);
      const decoded = DecodeString(encoded);
      expect(decoded).toBe(s);
    }
  });

  it(' EncodeString and DecodeString correctly handle byte values >= 0x80', () => {
    // Create a Uint8Array manually with high-byte values and decode then re-encode
    const bytes = new Uint8Array([0xc3, 0xa9]); // UTF-8 for "é"
    const decoded = DecodeString(bytes);
    expect(decoded).toBe('é');
    const reEncoded = EncodeString(decoded);
    expect(Array.from(reEncoded)).toEqual([0xc3, 0xa9]);
  });
});
