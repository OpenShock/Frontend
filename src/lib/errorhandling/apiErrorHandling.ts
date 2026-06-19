import { dev } from '$app/environment';
import type { ResponseError } from '$lib/api';
import { type ProblemDetails, isProblemDetails } from '$lib/errorhandling/ProblemDetails';
import { isError, isFetchError, isResponseError, isTypeError } from '$lib/typeguards/errorGuards';
import { toast } from 'svelte-sonner';
import { isValidationError } from './ValidationProblemDetails';

export type HandleProblemCallback = (problem: ProblemDetails) => boolean;

let _onUnauthorized: (() => void) | null = null;

/**
 * Register a callback that fires when any API response returns a 401.
 * Used to clear auth state when the session expires mid-flight (which
 * then tears down SignalR via the reactive lifecycle in auth-state).
 */
export function registerOnUnauthorized(callback: () => void) {
  _onUnauthorized = callback;
}

async function handleResponseError(
  error: ResponseError,
  handleProblemCallback: HandleProblemCallback | null
) {
  const response = error.response;
  if (response.status === 401) {
    _onUnauthorized?.();
  }

  // The HTTP client already consumed and parsed the response body before this
  // error was constructed, so we read it from `error.body` rather than calling
  // `response.json()` (which would throw "Body has already been consumed").
  const problem = error.body;
  if (!isProblemDetails(problem)) {
    console.error('Content json is not a valid problemdetails object', problem);
    return null;
  }

  if (dev) {
    console.groupCollapsed(`%cAPI Error: ${problem.title}`, 'color: red; font-weight: bold;');
    console.log('%cType:      ', 'font-weight: bold;', problem.type);
    console.log('%cStatus:    ', 'font-weight: bold;', problem.status);
    console.log('%cRequest ID:', 'font-weight: bold;', problem.requestId);
    if (problem.detail) {
      console.log('%cDetail:    ', 'font-style: italic;', problem.detail);
    }
    if (isValidationError(problem)) {
      // nicely tabulate the field errors
      console.groupCollapsed('%cField errors', 'font-style: italic;');
      for (const [field, messages] of Object.entries(problem.errors)) {
        console.group(`${field}`);
        messages.forEach((msg) => console.log(`• ${msg}`));
        console.groupEnd();
      }
      console.groupEnd(); // end Field errors
    }
    // allow peeking at the full object if you need it
    console.log('%cFull payload:', 'font-weight: normal;', problem);
    console.trace();
    console.groupEnd();
  }

  if (handleProblemCallback && handleProblemCallback(problem)) return;

  if (isValidationError(problem)) {
    const messages = Object.values(problem.errors).flat();
    toast.error(problem.title, {
      description: messages.length ? messages.join('\n') : problem.detail,
    });
    return;
  }

  toast.error(problem.title, { description: problem.detail });
}

export async function handleApiError(
  error: unknown,
  handleProblemCallback: HandleProblemCallback | null = null
): Promise<void> {
  if (!isError(error)) {
    console.error('Got unknown error', error);
    toast.error('Internal error occured');
    return;
  }

  if (isResponseError(error)) {
    handleResponseError(error, handleProblemCallback);
    return;
  }

  if (isFetchError(error)) {
    const cause = error.cause;
    if (isTypeError(cause)) {
      console.error(cause);
    } else {
      console.error('Got unknown fetch error', cause);
    }

    toast.error('Network error occured');
    return;
  }

  console.error(`Got ${error.name}`, error);

  toast.error('Internal error occured');
}
export function createApiErrorHandler(handleProblemCallback: HandleProblemCallback) {
  return (error: unknown) => handleApiError(error, handleProblemCallback);
}
