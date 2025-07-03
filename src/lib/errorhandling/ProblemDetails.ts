import { isNumber, isObject, isString } from '$lib/typeguards';

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
    Object.hasOwn(value, 'type') &&
    Object.hasOwn(value, 'title') &&
    Object.hasOwn(value, 'status') &&
    Object.hasOwn(value, 'requestId') &&
    (Object.hasOwn(value, 'detail') ? isString(value.detail) : true) &&
    isString(value.type) &&
    isString(value.title) &&
    isNumber(value.status) &&
    isString(value.requestId)
  );
}
