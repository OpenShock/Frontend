import type { TwColor } from '$lib/types/Tailwind';
import type { ValidationResult } from '$lib/types/ValidationResult';
import { calculateStringEntropy } from '$lib/utils/entropy';

function countCharacters(value: string): { lower: number; upper: number; digit: number; special: number } {
  const uniqueChars = new Set(value);
  let lower = 0;
  let upper = 0;
  let digit = 0;
  let special = 0;

  for (const char of uniqueChars) {
    if (char.match(/[a-z]/)) {
      lower++;
    } else if (char.match(/[A-Z]/)) {
      upper++;
    } else if (char.match(/[0-9]/)) {
      digit++;
    } else if ('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'.includes(char)) {
      special++;
    }
  }

  return { lower, upper, digit, special };
}

export function validatePassword(value: string): ValidationResult | null {
  if (value.length == 0) {
    return null;
  }

  const result = {
    valid: false,
    message: ''
  };

  if (value.length < 12) {
    result.message = 'Password is too short';
    return result;
  }

  if (value.length > 256) {
    result.message = `Seriously? ${value.length} characters? That's too much`;
    return result;
  }

  const trimmedLength = value.trim().length;
  if (trimmedLength == 0) {
    result.message = 'Password cannot consist of only whitespaces';
    return result;
  }

  if (trimmedLength != value.length) {
    result.message = 'Password cannot start or end with whitespace';
    return result;
  }

  const { lower, upper, digit, special } = countCharacters(value);
  if (lower < 1) {
    result.message = 'Password must contain a lowercase character';
    return result;
  }

  if (upper < 1) {
    result.message = 'Password must contain a uppercase character';
    return result;
  }

  if (digit < 1) {
    result.message = 'Password must contain a digit';
    return result;
  }

  if (special < 1) {
    result.message = 'Password must contain a special character';
    return result;
  }

  return { valid: true };
}

export function validatePasswordMatch(
  password: string,
  passwordConfirmation: string
): ValidationResult | null {
  if (password.length == 0) {
    return null;
  }

  if (password != passwordConfirmation) {
    return {
      valid: false,
      message: 'Passwords do not match',
    };
  }

  return { valid: true };
}

export function getPasswordStrength(value: string): { percent: number; text: string; color: TwColor } {
  let percent: number;
  let text: string;
  let color: TwColor;

  if (value.length === 0) {
    percent = 0;
    text = 'None';
    color = 'gray-500';
  } else {
    percent = Math.min((calculateStringEntropy(value) / 120) * 100, 100);

    if (percent < 30) {
      text = 'Very weak';
      color = 'red-500';
    } else if (percent < 50) {
      text = 'Weak';
      color = 'orange-500';
    } else if (percent < 60) {
      text = 'Fair';
      color = 'yellow-500';
    } else if (percent < 99) {
      text = 'Strong';
      color = 'green-500';
    } else {
      text = 'Very strong';
      color = 'cyan-500';
    }
  }

  return { percent, text, color };
}
