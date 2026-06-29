import { isObject } from '@openshock/svelte-core/typeguards/index.js';
import type { ValidationResult } from '@openshock/svelte-core/types/ValidationResult.js';
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
