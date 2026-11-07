import { HasNumber, HasString, isObject, isString } from '@openshock/svelte-core/typeguards';
import type { ProblemType } from './problemTypes';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  /** Set on problems built by the API's own error classes, absent on bare ASP.NET responses such as NotFound(). */
  requestId?: string;
  detail?: string;
}

/**
 * Extra fields some problem types carry.
 * See API/Common/Problems/CustomProblems and the error classes in API/Common/Errors.
 * Only `errors` is guarded at runtime (see isValidationError); the rest are optional on purpose.
 */
export interface ProblemExtensions {
  'Validation.Error': { errors: Record<string, string[]> };
  'Share.Request.Create.ShockerNotFound': { missingShockers?: string[] };
  'Shocker.Control.NotFound': { shockerId?: string };
  'Shocker.Control.Paused': { shockerId?: string };
  'Shocker.Control.NoPermission': { shockerId?: string };
  'Authorization.Token.PermissionMissing': {
    requiredPermission?: string;
    grantedPermissions?: string[];
  };
  'Authorization.Policy.NotMet': { failedRequirements?: string[] };
}

export type ProblemDetailsOf<T extends ProblemType> = ProblemDetails & {
  type: T;
} & (T extends keyof ProblemExtensions ? ProblemExtensions[T] : unknown);

export function isProblemDetails(value: unknown): value is ProblemDetails {
  return (
    isObject(value) &&
    HasString(value, 'type') &&
    HasString(value, 'title') &&
    HasNumber(value, 'status') &&
    (Object.hasOwn(value, 'requestId') ? isString(value.requestId) : true) &&
    (Object.hasOwn(value, 'detail') ? isString(value.detail) : true)
  );
}
