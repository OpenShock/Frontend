import { validateEmail } from './emailValidator';
import { describe, expect, it } from 'vitest';

describe('email validator test', () => {
  it('empty email should return null', () => {
    const result = validateEmail('');
    expect(result).toEqual(null);
  });
  it('invalid email should return false and error', () => {
    const result = validateEmail('invalid');
    expect(result).toEqual({
      valid: false,
      message: 'Invalid email',
    });
  });
  it('email with alias should return false and error', () => {
    const result = validateEmail('john+actual.address@email.com');
    expect(result).toEqual({
      valid: false,
      message: 'Email cannot contain aliases',
    });
  });
  it('valid email should return true and no error', () => {
    const result = validateEmail('valid.address@email.com');
    expect(result).toEqual({
      valid: true
    });
  });
});
