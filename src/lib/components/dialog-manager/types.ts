import type { Component, Snippet } from 'svelte';

// Props passed to dialog content components
export interface DialogContentProps<R = void> {
  resolve: (result: R) => void;
  close: () => void;
}

// Props for custom dialog snippets
export interface DialogRenderProps<T = void, R = void> extends DialogContentProps<R> {
  data: T;
}

// Generic dialog context - stores a component to render
export interface DialogContext<R = unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: Component<any>;
  props: Record<string, unknown>;
  resolve: (result: R) => void;
}

// Result types
export type ConfirmResult<T = void> = { confirmed: true; data: T } | { confirmed: false };

// Options for each dialog type
export interface CustomDialogOptions<T = void, R = void> {
  data?: T;
  contentSnippet: Snippet<[DialogRenderProps<T, R>]>;
}

export interface ConfirmDialogOptions<T = void> {
  title: string;
  desc?: string;
  data?: T;
  confirmButtonText?: string;
  cancelButtonText?: string;
  descSnippet?: Snippet<[T]>;
}

export interface AlertDialogOptions {
  title: string;
  desc?: string;
  buttonText?: string;
}

export interface AlertProps extends AlertDialogOptions {
  resolve: () => void;
  close: () => void;
}

export interface ConfirmProps<T> extends ConfirmDialogOptions<T> {
  resolve: (result: ConfirmResult<T>) => void;
  close: () => void;
}

export interface CustomProps<T, R> extends CustomDialogOptions<T, R> {
  resolve: (result: R) => void;
  close: () => void;
}
