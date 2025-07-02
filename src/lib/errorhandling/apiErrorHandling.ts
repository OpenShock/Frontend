import { FetchError, RequiredError, ResponseError } from '$lib/api/internal/v1';
import type { ProblemDetails } from '$lib/errorhandling/ProblemDetails';
import { toast } from 'svelte-sonner';

export type HandleProblemCallback = (problem: ProblemDetails) => boolean;

export async function handleApiError(
  error: any,
  handleProblemCallback: HandleProblemCallback | null = null
): Promise<void> {
  if (error instanceof ResponseError) {
    const problem = await getProblemDetails(error.response);

    if (problem === null) {
      console.error('Got error with problem of null', error); // TODO: Display toast
      return;
    }

    console.error('API error: ' + problem.title);

    if (handleProblemCallback && handleProblemCallback(problem)) {
      // TODO: Display toast
      return;
    }

    toast.error(problem.title);
    return;
  }

  if (error instanceof FetchError) {
    console.error('Got fetch error: ' + JSON.stringify(error)); // TODO: Display toast
    return;
  }

  if (error instanceof RequiredError) {
    console.error('Got required error: ' + JSON.stringify(error)); // TODO: Display toast
    return;
  }

  if (error instanceof Error) {
    console.error('Got generic error: ' + JSON.stringify(error)); // TODO: Display toast
    return;
  }

  if (Object.hasOwn(error, 'cause')) {
    console.error('Got unknown error type: ' + JSON.stringify(error)); // TODO: Display toast
    return;
  }

  console.error('Got error of unknown type', JSON.stringify(error)); // TODO: Display toast
}

async function getProblemDetails(response: Response): Promise<ProblemDetails | null> {
  const contentTypeHeader = response.headers.get('Content-Type');
  if (!contentTypeHeader) {
    console.error('No content type header found in response');
    return null;
  }

  if (!contentTypeHeader.startsWith('application/problem+json')) {
    console.error(
      'Content type header is not application/problem+json [' + contentTypeHeader + ']'
    );
    return null;
  }

  const problem = (await response.json()) as ProblemDetails;

  return problem;
}
