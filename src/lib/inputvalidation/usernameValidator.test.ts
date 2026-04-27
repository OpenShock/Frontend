import { UsernameAvailability } from '$lib/api/internal/v2';
import { describe, expect, it } from 'vitest';
import {
  UsernameAvailabilityUnknownValRes,
  UsernameAvailableValRes,
  UsernameInvalidValRes,
  UsernameTakenValRes,
  mapUsernameCheckResponse,
  validateUsername,
} from './usernameValidator';

describe('username validator test', () => {
  it('empty username should return null', () => {
    const result = validateUsername('');
    expect(result).toEqual(null);
  });
  it('username with less than 3 characters should return false and error', () => {
    const result = validateUsername('ab');
    expect(result).toEqual({
      valid: false,
      message: 'Username is too short',
    });
  });
  it('username with more than 32 characters should return false and error', () => {
    const result = validateUsername('a'.repeat(33));
    expect(result).toEqual({
      valid: false,
      message: 'Username is too long',
    });
  });
  it('username with only whitespaces should return false and error', () => {
    const result = validateUsername(' \r \n  \t  \r \n  ');
    expect(result).toEqual({
      valid: false,
      message: 'Username cannot consist of only whitespaces',
    });
  });
  it('username starting with whitespace should return false and error', () => {
    const result = validateUsername(' alice');
    expect(result).toEqual({
      valid: false,
      message: 'Username cannot start or end with whitespace',
    });
  });
  it('username ending with whitespace should return false and error', () => {
    const result = validateUsername('bob ');
    expect(result).toEqual({
      valid: false,
      message: 'Username cannot start or end with whitespace',
    });
  });
  it('username with consecutive whitespaces should return false and error', () => {
    const result = validateUsername('elite  gamer  2000');
    expect(result).toEqual({
      valid: false,
      message: 'Username cannot contain consecutive whitespaces',
    });
  });
  it('username with emoji should return false and error', () => {
    const result = validateUsername('GunnyUsername👍');
    expect(result).toEqual({
      valid: false,
      message: 'Emoji/Zalgo/Weird Unicode characters are not allowed in username',
    });
  });
  it('username with zalgo should return false and error', () => {
    const result = validateUsername('ZalgoUsername̛̛̛̛̛̛̛');
    expect(result).toEqual({
      valid: false,
      message: 'Emoji/Zalgo/Weird Unicode characters are not allowed in username',
    });
  });
  it('username with zero-width space should return false and error', () => {
    const result = validateUsername('ZeroWidthUsername\u200B');
    expect(result).toEqual({
      valid: false,
      message: 'Emoji/Zalgo/Weird Unicode characters are not allowed in username',
    });
  });
  it('username with nordic characters should return true', () => {
    const result = validateUsername('ÆØÅÅÄÖ');
    expect(result).toEqual({
      valid: true,
    });
  });
  it('username with arabic characters should return true', () => {
    const result = validateUsername('الاسم');
    expect(result).toEqual({
      valid: true,
    });
  });
  it('username with chinese characters should return true', () => {
    const result = validateUsername('用户名');
    expect(result).toEqual({
      valid: true,
    });
  });
  it('username with japanese characters should return true', () => {
    const result = validateUsername('ユーザー名');
    expect(result).toEqual({
      valid: true,
    });
  });
  it('username with korean characters should return true', () => {
    const result = validateUsername('사용자 이름');
    expect(result).toEqual({
      valid: true,
    });
  });
  it('username with russian characters should return true', () => {
    const result = validateUsername('имя пользователя');
    expect(result).toEqual({
      valid: true,
    });
  });
  it('username with whitespace should return true', () => {
    const result = validateUsername('user name');
    expect(result).toEqual({
      valid: true,
    });
  });
  it('username with email should return false and error', () => {
    const result = validateUsername('user@domain.tld');
    expect(result).toEqual({
      valid: false,
      message: 'Username cannot resemble an email address',
    });
  });
  it('valid username should return true and no error', () => {
    const result = validateUsername('validUsername');
    expect(result).toEqual({
      valid: true,
    });
  });

  it('accepts exactly 3 characters (lower boundary)', () => {
    expect(validateUsername('abc')).toEqual({ valid: true });
  });

  it('accepts exactly 32 characters (upper boundary)', () => {
    expect(validateUsername('a'.repeat(32))).toEqual({ valid: true });
  });

  it('rejects exactly 33 characters (just above max)', () => {
    expect(validateUsername('a'.repeat(33))).toEqual({
      valid: false,
      message: 'Username is too long',
    });
  });
});

describe('mapUsernameCheckResponse', () => {
  it('returns Available for Available availability', () => {
    expect(mapUsernameCheckResponse({ availability: UsernameAvailability.Available })).toEqual(
      UsernameAvailableValRes
    );
  });

  it('returns Taken for Taken availability', () => {
    expect(mapUsernameCheckResponse({ availability: UsernameAvailability.Taken })).toEqual(
      UsernameTakenValRes
    );
  });

  it('returns the error message when Invalid + error provided', () => {
    const res = mapUsernameCheckResponse({
      availability: UsernameAvailability.Invalid,
      error: { message: 'Reserved name' },
    });
    expect(res).toEqual({ valid: false, message: 'Reserved name' });
  });

  it('returns generic Invalid when Invalid without error', () => {
    expect(mapUsernameCheckResponse({ availability: UsernameAvailability.Invalid })).toEqual(
      UsernameInvalidValRes
    );
  });

  it('returns Unknown availability for unrecognised enum values', () => {
    expect(
      mapUsernameCheckResponse({ availability: 'totally-bogus' as UsernameAvailability })
    ).toEqual(UsernameAvailabilityUnknownValRes);
  });
});
