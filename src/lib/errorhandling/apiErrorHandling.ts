import { RateLimitError, type ResponseError } from '#lib/api/index.js';
import {
  type ProblemDetails,
  type ProblemDetailsOf,
  isProblemDetails,
} from '#lib/errorhandling/ProblemDetails.js';
import { m } from '#lib/paraglide/messages.js';
import { baseLocale, getLocale } from '#lib/paraglide/runtime.js';
import {
  isError,
  isFetchError,
  isResponseError,
  isTypeError,
} from '#lib/typeguards/errorGuards.js';
import { dev } from '$app/env';
import { toast } from 'svelte-sonner';
import { ProblemMessages } from './problemMessages';
import { type ProblemType, isKnownProblemType } from './problemTypes';
import { isValidationError } from './ValidationProblemDetails';

/**
 * Handles one problem type.
 * Return `false` to fall through to the default toast; any other return value counts as handled.
 */
export type ProblemHandler<T extends ProblemType = ProblemType> = (
  problem: ProblemDetailsOf<T>
) => boolean | void;

/**
 * Per-call-site overrides keyed by problem type.
 * `fallback` runs for any problem no specific handler claimed, including types the registry does not know.
 */
export type ProblemHandlers = { [K in ProblemType]?: ProblemHandler<K> } & {
  fallback?: (problem: ProblemDetails) => boolean | void;
};

/** Handler that swallows a problem silently, for cases the caller treats as expected. */
export const ignoreProblem: ProblemHandler = () => true;

/**
 * User-facing copy for a problem: translated registry copy first, backend title and detail as fallback.
 * The backend writes its detail in English, so under a translated title it is only shown while the
 * app is in English too; everywhere else a translated title alone beats a mixed-language toast.
 */
export function describeProblem(problem: ProblemDetails): { title: string; description?: string } {
  if (!isKnownProblemType(problem.type)) {
    return { title: problem.title, description: problem.detail };
  }
  const messages: { title?: () => string; description?: () => string } =
    ProblemMessages[problem.type];
  const backendDetail = getLocale() === baseLocale ? problem.detail : undefined;
  return {
    title: messages.title?.() ?? problem.title,
    description: messages.description?.() ?? backendDetail,
  };
}

let _onUnauthorized: (() => void) | null = null;

/**
 * Register a callback that fires when any API response returns a 401.
 * Used to clear auth state when the session expires mid-flight (which
 * then tears down SignalR via the reactive lifecycle in auth-state).
 */
export function registerOnUnauthorized(callback: () => void) {
  _onUnauthorized = callback;
}

function logProblem(problem: ProblemDetails) {
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
  if (!isKnownProblemType(problem.type)) {
    console.warn(
      `Problem type "${problem.type}" is not in src/lib/errorhandling/problemTypes.ts; add it so the UI can show proper copy.`
    );
  }
  // allow peeking at the full object if you need it
  console.log('%cFull payload:', 'font-weight: normal;', problem);
  console.trace();
  console.groupEnd();
}

function dispatch(problem: ProblemDetails, handlers: ProblemHandlers | undefined): boolean {
  if (!handlers) return false;

  if (isKnownProblemType(problem.type)) {
    const handler = handlers[problem.type] as ProblemHandler | undefined;
    // The handler was selected by `problem.type`, so the narrower parameter type holds here.
    if (handler && handler(problem as never) !== false) return true;
  }

  return handlers.fallback !== undefined && handlers.fallback(problem) !== false;
}

function toastProblem(problem: ProblemDetails) {
  const { title, description } = describeProblem(problem);

  if (isValidationError(problem)) {
    const messages = Object.values(problem.errors).flat();
    toast.error(title, { description: messages.length ? messages.join('\n') : description });
    return;
  }

  toast.error(title, { description });
}

function formatRetryAfter(ms: number | null): string | undefined {
  if (ms === null) return undefined;
  const seconds = Math.max(1, Math.ceil(ms / 1000));
  return m.error_retry_after({ seconds });
}

async function handleResponseError(error: ResponseError, handlers: ProblemHandlers | undefined) {
  const response = error.response;
  if (response.status === 401) {
    _onUnauthorized?.();
  }

  if (error instanceof RateLimitError) {
    toast.error(m.error_too_many_requests(), { description: formatRetryAfter(error.retryAfterMs) });
    return;
  }

  // The HTTP client already consumed and parsed the response body before this
  // error was constructed, so we read it from `error.body` rather than calling
  // `response.json()` (which would throw "Body has already been consumed").
  const problem = error.body;
  if (!isProblemDetails(problem)) {
    console.error('Content json is not a valid problemdetails object', problem);
    toast.error(m.error_unexpected_response(), { description: `HTTP ${response.status}` });
    return;
  }

  if (dev) logProblem(problem);

  if (dispatch(problem, handlers)) return;

  toastProblem(problem);
}

export async function handleApiError(error: unknown, handlers?: ProblemHandlers): Promise<void> {
  if (!isError(error)) {
    console.error('Got unknown error', error);
    toast.error(m.error_internal());
    return;
  }

  if (isResponseError(error)) {
    handleResponseError(error, handlers);
    return;
  }

  if (isFetchError(error)) {
    const cause = error.cause;
    if (isTypeError(cause)) {
      console.error(cause);
    } else {
      console.error('Got unknown fetch error', cause);
    }

    toast.error(m.error_network());
    return;
  }

  console.error(`Got ${error.name}`, error);

  toast.error(m.error_internal());
}

export function createApiErrorHandler(handlers: ProblemHandlers) {
  return (error: unknown) => handleApiError(error, handlers);
}
