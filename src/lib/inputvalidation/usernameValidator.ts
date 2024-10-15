import { validate as validateEmail } from 'email-validator';
import type { ValidationResult } from '$lib/types/ValidationResult';

/* eslint-disable no-misleading-character-class */

// This is taken from https://github.com/OpenShock/API/blob/develop/ServicesCommon/Validation/ChatsetMatchers.cs#L19
const MultipleWhiteSpaceRegex = /\s{2,}/;
const UnwantedCharacterRegex =
  /[\u0000-\u001F\u007F-\u00A0\u02B0-\u036F\u1400-\u17FF\u1AB0-\u1AFF\u1DC0-\u1DFF\u2000-\u209F\u20D0-\u21FF\u2300-\u23FF\u2460-\u24FF\u25A0-\u27BF\u2900-\u297F\u2B00-\u2BFF\uFE00-\uFE0F\u{1F000}-\u{1F02F}\u{1F0A0}-\u{10FFFF}\u00AD\u180B-\u180F\u3000]/u;

export function validateUsername(value: string): ValidationResult | null {
  if (value.length == 0) {
    return null;
  }

  if (value.length < 3) {
    return {
      valid: false,
      message: 'Username is too short',
    };
  }

  if (value.length > 32) {
    return {
      valid: false,
      message: 'Username is too long',
    };
  }

  const trimmedLength = value.trim().length;
  if (trimmedLength == 0) {
    return {
      valid: false,
      message: 'Username cannot consist of only whitespaces',
    };
  }

  if (trimmedLength != value.length) {
    return {
      valid: false,
      message: 'Username cannot start or end with whitespace',
    };
  }

  if (MultipleWhiteSpaceRegex.test(value)) {
    return {
      valid: false,
      message: 'Username cannot contain consecutive whitespaces',
    };
  }

  if (UnwantedCharacterRegex.test(value)) {
    return {
      valid: false,
      message: 'Emoji/Zalgo/Weird Unicode characters are not allowed in username',
    };
  }

  if (validateEmail(value)) {
    return {
      valid: false,
      message: 'Username cannot be an email',
    };
  }

  return { valid: true };
}
