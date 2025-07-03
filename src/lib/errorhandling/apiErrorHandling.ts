import { type ProblemDetails, isProblemDetails } from '$lib/errorhandling/ProblemDetails';
import {
  isError,
  isFetchError,
  isRequiredError,
  isResponseError,
} from '$lib/typeguards/errorGuards';
import { toast } from 'svelte-sonner';
import { isValidationError as isValidationProblem } from './ValidationProblemDetails';

export type HandleProblemCallback = (problem: ProblemDetails) => boolean;

async function handleResponseError(
  response: Response,
  handleProblemCallback: HandleProblemCallback | null
) {
  const contentTypeHeader = response.headers.get('Content-Type');
  if (!contentTypeHeader) {
    console.error('No content type header found in response');
    return;
  }

  if (!contentTypeHeader.startsWith('application/problem+json')) {
    console.error(
      'Content type header is not application/problem+json [' + contentTypeHeader + ']'
    );
    return;
  }

  const problem = await response.json();
  if (!isProblemDetails(problem)) {
    console.error('Content json is not a valid problemdetails object', problem);
    return null;
  }

  console.groupCollapsed(`%cAPI Error: ${problem.title}`, 'color: red; font-weight: bold;');
  console.log('%cType:      ', 'font-weight: bold;', problem.type);
  console.log('%cStatus:    ', 'font-weight: bold;', problem.status);
  console.log('%cRequest ID:', 'font-weight: bold;', problem.requestId);
  if (problem.detail) {
    console.log('%cDetail:    ', 'font-style: italic;', problem.detail);
  }
  if (isValidationProblem(problem)) {
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

  if (handleProblemCallback && !handleProblemCallback(problem)) return;

  toast.error(problem.title);
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
    handleResponseError(error.response, handleProblemCallback);
    return;
  }

  if (isFetchError(error)) {
    console.error('Got FetchError', error);
    toast.error('Network error occured');
    return;
  }

  if (isRequiredError(error)) {
    // group it so you can collapse/expand in the dev console
    console.groupCollapsed(
      '%cRequiredError ⚠️ Missing parameter',
      'color: orange; font-weight: bold;'
    );
    console.log('%cParameter:', 'font-weight: bold;', error.field);
    console.log('%cMessage:  ', 'font-style: italic;', error.message);
    console.trace(); // show stack trace so you know exactly where it bubbled up
    console.groupEnd();
  } else {
    console.error(`Got ${error.name}`, error);
  }

  toast.error('Internal error occured');
}
