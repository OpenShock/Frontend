import type { ProblemType } from './problemTypes';

/**
 * Message key prefix for a problem type, such as `problem_account_email_taken` for `Account.Email.Taken`.
 * The registry text is the English source, and messages/*.json hold one translation per field under this prefix.
 */
export function problemMessageKey(type: ProblemType): string {
  const snake = type
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2');
  return `problem_${snake.replaceAll('.', '_').toLowerCase()}`;
}
