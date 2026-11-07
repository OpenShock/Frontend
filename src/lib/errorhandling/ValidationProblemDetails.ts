import { isObject } from '@openshock/svelte-core/typeguards';
import type { ValidationResult } from '@openshock/svelte-core/types';
import type { ProblemDetails, ProblemDetailsOf } from './ProblemDetails';

export type ValidationProblemDetails = ProblemDetailsOf<'Validation.Error'>;

export function isValidationError(
  problemdetails: ProblemDetails
): problemdetails is ValidationProblemDetails {
  return (
    problemdetails.type === 'Validation.Error' &&
    Object.hasOwn(problemdetails, 'errors') &&
    isObject(problemdetails.errors)
  );
}

export function mapToValRes(
  problem: ValidationProblemDetails,
  key: string
): ValidationResult | null {
  const errors = problem.errors[key];
  return errors ? { valid: false, message: errors[0] } : null;
}

/** Pulls the first message for each listed field; `null` where the field had no error. */
export function fieldErrors<K extends string>(
  problem: ValidationProblemDetails,
  keys: readonly K[]
): Record<K, ValidationResult | null> {
  const result = {} as Record<K, ValidationResult | null>;
  for (const key of keys) result[key] = mapToValRes(problem, key);
  return result;
}
