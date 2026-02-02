import { isObject, isString } from '$lib/typeguards';
import { HasNumber, HasString } from '$lib/typeguards/propGuards';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  requestId: string;
  detail?: string;
}

export function isProblemDetails(value: unknown): value is ProblemDetails {
  return (
    isObject(value) &&
    HasString(value, 'type') &&
    HasString(value, 'title') &&
    HasNumber(value, 'status') &&
    HasString(value, 'requestId') &&
    (Object.hasOwn(value, 'detail') ? isString(value.detail) : true)
  );
}
