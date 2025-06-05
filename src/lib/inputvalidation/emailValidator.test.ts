import { describe, expect, it } from 'vitest';
import { isEmailAddress, validateEmail } from './emailValidator';

describe('isEmailAddress', () => {
  it('returns false for empty string', () => {
    expect(isEmailAddress('')).toBe(false);
  });

  it('returns false when missing "@" or has multiple "@"', () => {
    expect(isEmailAddress('plainaddress')).toBe(false);
    expect(isEmailAddress('a@b@c.com')).toBe(false);
  });

  it('returns false when total length exceeds 320 characters', () => {
    const localPart = 'a'.repeat(64);
    const domainLabel = 'b'.repeat(63);
    const domain = Array(5).fill(domainLabel).join('.'); // 5×63 + 4 dots = 319
    const validEmail = `${localPart}@${domain}`; // 384 chars total
    expect(validEmail.length).toBe(64 + 1 + 319);
    expect(isEmailAddress(validEmail)).toBe(false);
  });

  it('returns false when local part exceeds 64 characters', () => {
    const account = 'x'.repeat(65);
    const address = 'domain.com';
    expect(isEmailAddress(`${account}@${address}`)).toBe(false);
  });

  it('returns false when domain part exceeds 255 characters', () => {
    const account = 'user';
    const longLabel = 'd'.repeat(63);
    // 4 labels of 63 chars + 3 dots = 4*63 + 3 = 255
    const domain = Array(4).fill(longLabel).join('.');
    expect(domain.length).toBe(255);
    // Prepend one character to push domain over 255
    const tooLongDomain = 'e' + domain;
    expect(isEmailAddress(`${account}@${tooLongDomain}`)).toBe(false);
  });

  it('returns false when any domain label exceeds 63 characters', () => {
    const account = 'user';
    const longLabel = 'd'.repeat(64);
    const address = `${longLabel}.com`;
    expect(isEmailAddress(`${account}@${address}`)).toBe(false);
  });

  it('returns false for invalid characters or formats not matching regex', () => {
    // starts with a dot
    expect(isEmailAddress('.user@domain.com')).toBe(false);
    // consecutive dots in local part
    expect(isEmailAddress('user..name@domain.com')).toBe(false);
    // hyphen at start of domain label
    expect(isEmailAddress('user@-domain.com')).toBe(false);
    // no TLD
    expect(isEmailAddress('user@domain')).toBe(false);
  });

  it('returns true for valid standard email addresses', () => {
    expect(isEmailAddress('simple@example.com')).toBe(true);
    expect(isEmailAddress('very.common@example.co.uk')).toBe(true);
    expect(isEmailAddress("o'reilly@example.io")).toBe(true);
    expect(isEmailAddress('user_name-123@sub.domain.com')).toBe(true);
  });
});

describe('validateEmail', () => {
  it('returns null for empty input', () => {
    const result = validateEmail('');
    expect(result).toBeNull();
  });

  it('returns valid: false and message "Invalid email" for syntactically invalid addresses', () => {
    const invalids = [
      'noatsign.com',
      'user@.com',
      'user@domain..com',
      'user@domain',
      'toolong' + 'a'.repeat(320) + '@example.com',
    ];
    for (const addr of invalids) {
      const result = validateEmail(addr);
      expect(result).not.toBeNull();
      expect(result?.valid).toBe(false);
      expect(result?.message).toBe('Invalid email');
    }
  });

  it('returns valid: false and message "Email cannot contain aliases" when email contains "+"', () => {
    const withAlias = 'user+alias@example.com';
    const result = validateEmail(withAlias);
    expect(result).not.toBeNull();
    expect(result?.valid).toBe(false);
    expect(result?.message).toBe('Email cannot contain aliases');
  });

  it('returns valid: true for valid email without "+"', () => {
    const valid = 'firstname.lastname@domain.com';
    const result = validateEmail(valid);
    expect(result).not.toBeNull();
    expect(result?.valid).toBe(true);
    expect(result).not.toHaveProperty('message');
  });

  it('treats "+" anywhere in the local part as invalid alias', () => {
    const examples = [
      'plus+sign@domain.com',
      '+start@domain.com',
      'end+@domain.com',
      'middle+more@sub.domain.org',
    ];
    for (const addr of examples) {
      const result = validateEmail(addr);
      expect(result).not.toBeNull();
      expect(result?.valid).toBe(false);
      expect(result?.message).toBe('Email cannot contain aliases');
    }
  });

  it('does not reject valid emails with hyphens in domain or underscores in local part', () => {
    const examples = [
      'user_name@example-domain.com', // underscore in local, hyphen in domain
      'another.user-name@sub.domain.com', // hyphen in both portions
    ];
    for (const addr of examples) {
      const result = validateEmail(addr);
      expect(result).not.toBeNull();
      expect(result?.valid).toBe(true);
    }
  });
});
