import { describe, expect, it } from 'vitest';
import { getPasswordStrength, validatePassword, validatePasswordMatch } from './passwordValidator';

describe('validatePassword', () => {
  it('returns null for empty password', () => {
    const result = validatePassword('');
    expect(result).toBeNull();
  });

  it('rejects passwords shorter than 12 characters', () => {
    const result = validatePassword('shortPwd1!');
    expect(result).not.toBeNull();
    expect(result?.valid).toBe(false);
    expect(result?.message).toBe('Password is too short');
  });

  it('rejects passwords longer than 256 characters', () => {
    const longPwd = 'a'.repeat(257);
    const result = validatePassword(longPwd);
    expect(result).not.toBeNull();
    expect(result?.valid).toBe(false);
    expect(result?.message).toBe(`Seriously? ${longPwd.length} characters? That's too much`);
  });

  it('rejects passwords consisting only of whitespaces', () => {
    const spaces = ' \r \n  \t  \r \n  ';
    const result = validatePassword(spaces);
    expect(result).not.toBeNull();
    expect(result?.valid).toBe(false);
    expect(result?.message).toBe('Password cannot consist of only whitespaces');
  });

  it('rejects passwords that start or end with whitespace', () => {
    const leading = ' validPassword123';
    const trailing = 'validPassword123 ';
    const both = ' validPassword123 ';
    for (const pwd of [leading, trailing, both]) {
      const result = validatePassword(pwd);
      expect(result).not.toBeNull();
      expect(result?.valid).toBe(false);
      expect(result?.message).toBe('Password cannot start or end with whitespace');
    }
  });

  it('accepts valid passwords of acceptable length and no leading/trailing whitespace', () => {
    const valid = 'ValidPassword123';
    const result = validatePassword(valid);
    expect(result).not.toBeNull();
    expect(result?.valid).toBe(true);
    expect(result).not.toHaveProperty('message');
  });
});

describe('validatePasswordMatch', () => {
  it('returns null when original password is empty', () => {
    const result = validatePasswordMatch('', 'anything');
    expect(result).toBeNull();
  });

  it('rejects non-matching passwords', () => {
    const result = validatePasswordMatch('password123', 'password124');
    expect(result).not.toBeNull();
    expect(result?.valid).toBe(false);
    expect(result?.message).toBe('Passwords do not match');
  });

  it('accepts matching passwords', () => {
    const result = validatePasswordMatch('password123', 'password123');
    expect(result).not.toBeNull();
    expect(result?.valid).toBe(true);
    expect(result).not.toHaveProperty('message');
  });
});

describe('getPasswordStrength', () => {
  it('returns None/gray-500/0% for empty string', () => {
    const { percent, text, color } = getPasswordStrength('');
    expect(percent).toBe(0);
    expect(text).toBe('None');
    expect(color).toBe('gray-500');
  });

  it('rates a repeated single-character password as Very weak (red-500)', () => {
    // "aaaaaaaaaaaa" (12×'a'): uniqueLength=1 ⇒ entropy=0 ⇒ percent=0 ⇒ <30
    const pwd = 'a'.repeat(12);
    const { percent, text, color } = getPasswordStrength(pwd);
    expect(percent).toBe(0);
    expect(text).toBe('Very weak');
    expect(color).toBe('red-500');
  });

  it('rates a moderately varied 12-character password as Weak (orange-500)', () => {
    // "abcABC123!@#": length=12, uniqueLength=12 ⇒ entropy≈43 ⇒ percent≈35.8 ⇒ <50
    const pwd = 'abcABC123!@#';
    const { percent, text, color } = getPasswordStrength(pwd);
    expect(percent).toBeGreaterThanOrEqual(30);
    expect(percent).toBeLessThan(50);
    expect(text).toBe('Weak');
    expect(color).toBe('orange-500');
  });

  it('rates a 60-character password with two unique chars as Fair (yellow-500)', () => {
    // 60×(two-character alphabet) ⇒ entropy=60*1=60 ⇒ percent=50 ⇒ <60
    const pwd = 'ab'.repeat(30);
    const { percent, text, color } = getPasswordStrength(pwd);
    expect(percent).toBeCloseTo(50, 1);
    expect(text).toBe('Fair');
    expect(color).toBe('yellow-500');
  });

  it('rates a 72-character password with two unique chars as Strong (green-500)', () => {
    // 72×(two-character alphabet) ⇒ entropy=72 ⇒ percent=60 ⇒ <99
    const pwd = 'ab'.repeat(36);
    const { percent, text, color } = getPasswordStrength(pwd);
    expect(percent).toBeCloseTo(60, 1);
    expect(text).toBe('Strong');
    expect(color).toBe('green-500');
  });

  it('caps strength at 100% and rates as Very strong (cyan-500) for high entropy', () => {
    // 100 random characters
    const randomBytes = new Uint8Array(100);
    crypto.getRandomValues(randomBytes);
    const pwd = Array.from(randomBytes, (b) => String.fromCharCode((b % 94) + 33)).join('');

    const { percent, text, color } = getPasswordStrength(pwd);
    expect(percent).toBe(100);
    expect(text).toBe('Very strong');
    expect(color).toBe('cyan-500');
  });
});
