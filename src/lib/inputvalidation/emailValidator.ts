import type { ValidationResult } from '$lib/types/ValidationResult';
import { validate } from 'email-validator';

export function validateEmail(value: string): ValidationResult | null {
  if (value.length == 0) {
    return null;
  }

  if (!validate(value)) {
    return {
      valid: false,
      message: 'Invalid email',
    };
  }

  if (value.includes('+')) {
    return {
      valid: false,
      message: 'Email cannot contain aliases',
    };
  }

  return { valid: true };
}
