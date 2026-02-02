import { isObject } from '$lib/typeguards';
import type { ValidationResult } from '$lib/types/ValidationResult';
import type { ProblemDetails } from './ProblemDetails';

export interface ValidationProblemDetails extends ProblemDetails {
  errors: Record<string, string[]>;
}

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
