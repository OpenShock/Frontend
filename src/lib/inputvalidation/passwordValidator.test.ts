import { describe, expect, it } from 'vitest';
import { validatePassword, validatePasswordMatch } from './passwordValidator';

describe('email validator test', () => {
  it('empty password should return null', () => {
    const result = validatePassword('');
    expect(result).toEqual(null);
  });
  it('password with less than 12 characters should return false and error', () => {
    const result = validatePassword('obfuscation');
    expect(result).toEqual({
      valid: false,
      message: 'Password is too short',
    });
  });
  it('password with length more than 256 characters should return false and error', () => {
    const result = validatePassword('a'.repeat(257));
    expect(result).toEqual({
      valid: false,
      message: `Seriously? 257 characters? That's too much`,
    });
  });
  it('password with only whitespaces should return false and error', () => {
    const result = validatePassword(' \r \n  \t  \r \n  ');
    expect(result).toEqual({
      valid: false,
      message: 'Password cannot consist of only whitespaces',
    });
  });
  it('password starting with whitespace should return false and error', () => {
    const result = validatePassword(' myinsecurepassword123');
    expect(result).toEqual({
      valid: false,
      message: 'Password cannot start or end with whitespace',
    });
  });
  it('password ending with whitespace should return false and error', () => {
    const result = validatePassword('myinsecurepassword123 ');
    expect(result).toEqual({
      valid: false,
      message: 'Password cannot start or end with whitespace',
    });
  });
  it('password match with different password should return false and error', () => {
    const result = validatePasswordMatch('password', 'differentpassword');
    expect(result).toEqual({
      valid: false,
      message: 'Passwords do not match',
    });
  });
  it('password match with invalid password should return false and error', () => {
    const result = validatePasswordMatch('password', 'password');
    expect(result).toEqual({
      valid: true,
    });
  });
});
