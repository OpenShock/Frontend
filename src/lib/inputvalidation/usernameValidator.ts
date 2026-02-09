import { type UsernameCheckResponse } from '$lib/api/internal/v1';
import { UsernameAvailability } from '$lib/api/internal/v2';
import { isEmailAddress } from '$lib/inputvalidation/emailValidator';
import type { ValidationResult } from '$lib/types/ValidationResult';

/* eslint-disable no-misleading-character-class */

// This is taken from https://github.com/OpenShock/API/blob/develop/ServicesCommon/Validation/ChatsetMatchers.cs#L19
const MultipleWhiteSpaceRegex = /\s{2,}/;

// eslint-disable no-control-regex
const UnwantedCharacterRegex =
  /[\u0000-\u001F\u007F-\u00A0\u02B0-\u036F\u1400-\u17FF\u1AB0-\u1AFF\u1DC0-\u1DFF\u2000-\u209F\u20D0-\u21FF\u2300-\u23FF\u2460-\u24FF\u25A0-\u27BF\u2900-\u297F\u2B00-\u2BFF\uFE00-\uFE0F\u{1F000}-\u{1F02F}\u{1F0A0}-\u{10FFFF}\u00AD\u180B-\u180F\u3000]/u;

export const UsernameTooShortValRes: ValidationResult = {
  valid: false,
  message: 'Username is too short',
};

export const UsernameTooLongValRes: ValidationResult = {
  valid: false,
  message: 'Username is too long',
};

export const UsernameIsWhitespaceValRes: ValidationResult = {
  valid: false,
  message: 'Username cannot consist of only whitespaces',
};

export const UsernameStartsOrEndsWithWhitespaceValRes: ValidationResult = {
  valid: false,
  message: 'Username cannot start or end with whitespace',
};

export const UsernameConsecutiveWhitespacesValRes: ValidationResult = {
  valid: false,
  message: 'Username cannot contain consecutive whitespaces',
};

export const UsernameBannedCharactersValRes: ValidationResult = {
  valid: false,
  message: 'Emoji/Zalgo/Weird Unicode characters are not allowed in username',
};

export const UsernameResemblesEmailValRes: ValidationResult = {
  valid: false,
  message: 'Username cannot resemble an email address',
};

export const UsernameCheckingAvailabilityValRes: ValidationResult = {
  valid: false,
  message: 'Checking username availability...',
  color: 'gray-500',
};

export const UsernameAvailableValRes: ValidationResult = {
  valid: true,
  message: 'Username is available',
};

export const UsernameTakenValRes: ValidationResult = {
  valid: false,
  message: 'Username is already taken',
};

export const UsernameInvalidValRes: ValidationResult = {
  valid: false,
  message: 'Username invalid',
};

export const UsernameAvailabilityUnknownValRes: ValidationResult = {
  valid: false,
  message: 'Unknown username availability',
};

export const UsernameInternalServerErrorValRes: ValidationResult = {
  valid: false,
  message: 'Internal server error',
};

export function validateUsername(value: string): ValidationResult | null {
  if (value.length == 0) {
    return null;
  }

  if (value.length < 3) {
    return UsernameTooShortValRes;
  }

  if (value.length > 32) {
    return UsernameTooLongValRes;
  }

  const trimmedLength = value.trim().length;
  if (trimmedLength == 0) {
    return UsernameIsWhitespaceValRes;
  }

  if (trimmedLength != value.length) {
    return UsernameStartsOrEndsWithWhitespaceValRes;
  }

  if (MultipleWhiteSpaceRegex.test(value)) {
    return UsernameConsecutiveWhitespacesValRes;
  }

  if (UnwantedCharacterRegex.test(value)) {
    return UsernameBannedCharactersValRes;
  }

  if (isEmailAddress(value)) {
    return UsernameResemblesEmailValRes;
  }

  return { valid: true };
}

export function mapUsernameCheckResponse({
  availability,
  error,
}: UsernameCheckResponse): ValidationResult {
  switch (availability) {
    case UsernameAvailability.Available:
      return UsernameAvailableValRes;
    case UsernameAvailability.Taken:
      return UsernameTakenValRes;
    case UsernameAvailability.Invalid:
      break;
    default:
      return UsernameAvailabilityUnknownValRes;
  }

  if (!error) {
    return UsernameInvalidValRes;
  }

  return {
    valid: false,
    message: error.message,
  };
}
