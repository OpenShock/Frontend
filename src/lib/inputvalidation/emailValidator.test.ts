import { validateEmail } from './emailValidator';
import { describe, expect, it } from 'vitest';

describe('email validator test', () => {
  it('validate empty email should return null', () => {
    const result = validateEmail('');
    expect(result).toEqual(null);
  });
  it('validate invalid email should return false and error', () => {
    const result = validateEmail('invalid');
    expect(result).toEqual({
      valid: false,
      message: 'Invalid email',
    });
  });
  it('validate email with alias should return false and error', () => {
    const result = validateEmail('john+actual.address@email.com');
    expect(result).toEqual({
      valid: false,
      message: 'Email cannot contain aliases',
    });
  });
  it('validate valid email should return true and no error', () => {
    const result = validateEmail('valid.address@email.com');
    expect(result).toEqual({
      valid: true
    });
  });
});
