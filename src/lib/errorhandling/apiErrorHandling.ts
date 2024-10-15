import { ResponseError } from "$lib/api/internal/v1";
import type { ToastStore } from "@skeletonlabs/skeleton";
import type { ProblemDetails } from "./ProblemDetails";


export type HandleProblemCallback = (problem: ProblemDetails) => boolean;

export async function handleApiError(error: any, toastStore: ToastStore,
     handleProblemCallback: HandleProblemCallback | null = null): Promise<void> {
    if (!(error instanceof ResponseError)) {
        return;
    }

    const problem = await getProblemDetails(error.response);

    if (problem === null) {
        return;
    }

    console.error("API error: " + problem.title);

    if(handleProblemCallback && handleProblemCallback(problem)) {
        return;
    }

    toastStore.trigger({
        background: 'variant-filled-error',
        message: problem.title,
      });
}

async function getProblemDetails(response: Response): Promise<ProblemDetails | null> {
    const contentTypeHeader = response.headers.get("Content-Type");
    if (!contentTypeHeader) {
        console.error("No content type header found in response");
        return null;
    }

    if(!contentTypeHeader.startsWith('application/problem+json')) {
        console.error("Content type header is not application/problem+json [" 
            + contentTypeHeader + "]");
        return null;
    }

    const problem = (await response.json()) as ProblemDetails;

    return problem;
}