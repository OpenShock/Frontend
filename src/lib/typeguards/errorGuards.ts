import { FetchError, ResponseError } from '$lib/api/internal/errors';

// TODO: Use Error.isError() when compatibility reaches Baseline (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/isError)
export function isError(error: unknown): error is Error {
  return (
    error instanceof Error ||
    (error !== null &&
      typeof error === 'object' &&
      Object.hasOwn(error, 'name') &&
      Object.hasOwn(error, 'cause') &&
      Object.hasOwn(error, 'message'))
  );
}

export function isResponseError(error: Error): error is ResponseError {
  return (
    error instanceof ResponseError ||
    (error.name === 'ResponseError' && Object.hasOwn(error, 'response'))
  );
}

export function isFetchError(error: Error): error is FetchError {
  return error instanceof FetchError || error.name === 'FetchError';
}

export function isTypeError(error: Error): error is TypeError {
  return error instanceof TypeError || error.name === 'TypeError';
}
