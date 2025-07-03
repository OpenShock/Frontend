import { isObject } from '$lib/typeguards';
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
