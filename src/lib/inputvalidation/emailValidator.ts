import type { ValidationResult } from '$lib/types/ValidationResult';

const emailRegex = /^[\w-!#$%&'*+/=?^`{|}~](\.?[\w-!#$%&'*+/=?^`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

export function isEmailAddress(value: string): boolean {
  if (!value) return false;
  if (value.length > 320) return false;

  const emailParts = value.split('@');

  if (emailParts.length !== 2) return false;

  const [account, address] = emailParts;

  if (account.length > 64) return false;
  if (address.length > 255) return false;

  const domainParts = address.split('.');

  if (domainParts.some(part => part.length > 63)) return false;

  return emailRegex.test(value);
}

export function validateEmail(value: string): ValidationResult | null {
  if (value.length == 0) {
    return null;
  }

  if (!isEmailAddress(value)) {
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
