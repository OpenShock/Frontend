import type { Snippet } from 'svelte';
import { writable } from 'svelte/store';

export interface ConfirmDialogContext<T> {
  data: T;
  onConfirm: (value: T) => void;
  title: string;
  desc?: string;
  confirmButtonText?: string;
  descSnippet?: Snippet<[T]>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export const ConfirmDialogStore = writable<ConfirmDialogContext<any> | null>(null);

export function openConfirmDialog<T>(context: ConfirmDialogContext<T>) {
  ConfirmDialogStore.set(context);
}
