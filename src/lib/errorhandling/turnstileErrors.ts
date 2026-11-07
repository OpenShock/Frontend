import type { ProblemDetails } from '#lib/errorhandling/ProblemDetails.js';
import { toast } from 'svelte-sonner';

/**
 * Handles the `Turnstile.Invalid` problem shared by every form that submits a Turnstile token.
 * The caller is expected to have reset the widget already, so a fresh token is on its way.
 * Returns true when the problem was handled.
 */
export function handleTurnstileProblem(problem: ProblemDetails): boolean {
  if (problem.type !== 'Turnstile.Invalid') return false;
  toast.error('Verification failed', {
    description: 'Please complete the challenge again and retry.',
  });
  return true;
}
