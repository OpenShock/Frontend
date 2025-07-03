import { FetchError as FetchErrorV1, RequiredError as RequiredErrorV1, ResponseError as ResponseErrorV1 } from "$lib/api/internal/v1";
import { FetchError as FetchErrorV2, RequiredError as RequiredErrorV2, ResponseError as ResponseErrorV2 } from "$lib/api/internal/v2";

// TODO: Use Error.isError() when compatibility reaches Baseline (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/isError)
export function isError(error: unknown): error is Error {
  return error instanceof Error || (
    error !== null &&
    typeof error === 'object' &&
    Object.hasOwn(error, 'name') &&
    Object.hasOwn(error, 'cause') &&
    Object.hasOwn(error, 'message')
  );
}

export function isResponseError(error: Error): error is ResponseErrorV1 | ResponseErrorV2 {
  return error instanceof ResponseErrorV1 || error instanceof ResponseErrorV2 || (error.name === 'ResponseError' && Object.hasOwn(error, 'response'));
}
export function isFetchError(error: Error): error is FetchErrorV1 | FetchErrorV2 {
  return error instanceof FetchErrorV1 || error instanceof FetchErrorV2 || error.name === 'FetchError';
}
export function isRequiredError(error: Error): error is RequiredErrorV1 | RequiredErrorV2 {
  return error instanceof RequiredErrorV1 || error instanceof RequiredErrorV2 || error.name === 'RequiredError';
}
