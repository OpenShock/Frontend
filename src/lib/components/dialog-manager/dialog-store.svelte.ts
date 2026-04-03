import { SvelteMap } from 'svelte/reactivity';
import DialogAlertContent from './dialog-alert-content.svelte';
import DialogConfirmContent from './dialog-confirm-content.svelte';
import DialogCustomContent from './dialog-custom-content.svelte';
import type {
  AlertDialogOptions,
  ConfirmDialogOptions,
  ConfirmResult,
  CustomDialogOptions,
  DialogContext,
} from './types';

// State
let dialogCount = $state(0);
const dialogs = new SvelteMap<number, DialogContext>();

export function getOldestDialog(): [number, DialogContext] | null {
  const firstEntry = dialogs.entries().next();
  return firstEntry.done ? null : firstEntry.value;
}

export function removeDialog(id: number): void {
  dialogs.delete(id);
}

// Helper to create dialog with common setup
export function createDialog<R>(
  contextFactory: (resolve: (result: R) => void) => DialogContext<R>
): Promise<R> {
  const { promise, resolve } = Promise.withResolvers<R>();
  const id = ++dialogCount;
  let resolved = false;

  const wrappedResolve = (result: R) => {
    if (resolved) return;
    resolved = true;
    setTimeout(() => removeDialog(id), 150);
    resolve(result);
  };

  dialogs.set(id, contextFactory(wrappedResolve) as DialogContext);
  return promise;
}

/**
 * Opens a fully custom dialog with your own content snippet.
 */
export function open<T = void, R = void>(options: CustomDialogOptions<T, R>): Promise<R> {
  return createDialog<R>((resolve) => ({
    content: DialogCustomContent,
    props: {
      data: options.data,
      contentSnippet: options.contentSnippet,
      resolve,
      close: () => resolve(undefined as R),
    },
    resolve,
  }));
}

/**
 * Opens a confirm dialog with built-in confirm/cancel buttons.
 */
export function confirm<T = void>(options: ConfirmDialogOptions<T>): Promise<ConfirmResult<T>> {
  return createDialog<ConfirmResult<T>>((resolve) => ({
    content: DialogConfirmContent,
    props: {
      ...options,
      resolve,
      close: () => resolve({ confirmed: false }),
    },
    resolve,
  }));
}

/**
 * Opens an alert dialog that the user acknowledges.
 */
export function alert(options: AlertDialogOptions): Promise<void> {
  return createDialog<void>((resolve) => ({
    content: DialogAlertContent,
    props: {
      ...options,
      resolve,
      close: () => resolve(),
    },
    resolve,
  }));
}

export const dialog = {
  open,
  confirm,
  alert,
  createDialog,
};
