import { onDestroy } from 'svelte';
import { toast } from 'svelte-sonner';

const DEFAULT_SUCCESS_MESSAGE = 'Copied to clipboard';
const DEFAULT_ERROR_MESSAGE = 'Failed to copy to clipboard';

/**
 * Writes text to the clipboard and toasts the outcome. Fire-and-forget — use
 * when no reactive feedback is needed. For a reactive `copied` flag, use the
 * `Clipboard` class.
 */
export async function copyToClipboard(
  text: string,
  successMessage: string = DEFAULT_SUCCESS_MESSAGE
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
    return true;
  } catch {
    // Insecure context, permission denied, tab not focused, etc.
    toast.error(DEFAULT_ERROR_MESSAGE);
    return false;
  }
}

export interface ClipboardOptions {
  /** How long `copied` stays true after a successful copy, in ms. Defaults to 2000. */
  resetDelay?: number;
}

/**
 * Clipboard wrapper with a reactive `copied` flag that auto-resets. Call
 * `dispose()` when done (or use `useClipboard` to do that automatically).
 */
export class Clipboard {
  readonly #resetDelay: number;
  #timeout?: ReturnType<typeof setTimeout>;
  #copied = $state(false);

  constructor(options: ClipboardOptions = {}) {
    this.#resetDelay = options.resetDelay ?? 2000;
  }

  get copied() {
    return this.#copied;
  }

  async copy(text: string, successMessage?: string): Promise<boolean> {
    const ok = await copyToClipboard(text, successMessage);
    if (!ok) return false;

    this.#copied = true;
    clearTimeout(this.#timeout);
    this.#timeout = setTimeout(() => (this.#copied = false), this.#resetDelay);
    return true;
  }

  /** Clears any pending reset timeout. */
  dispose() {
    clearTimeout(this.#timeout);
    this.#timeout = undefined;
  }
}

/** Component-aware `Clipboard` that clears pending reset timeouts on unmount. */
export function useClipboard(options?: ClipboardOptions): Clipboard {
  const clip = new Clipboard(options);
  onDestroy(() => clip.dispose());
  return clip;
}
