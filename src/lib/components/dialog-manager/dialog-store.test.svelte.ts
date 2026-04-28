import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the Svelte component imports — just need a non-null placeholder
vi.mock('./dialog-alert-content.svelte', () => ({ default: { type: 'AlertContent' } }));
vi.mock('./dialog-confirm-content.svelte', () => ({ default: { type: 'ConfirmContent' } }));
vi.mock('./dialog-custom-content.svelte', () => ({ default: { type: 'CustomContent' } }));

describe('dialog store', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('getOldestDialog returns null when no dialogs are open', async () => {
    const { getOldestDialog } = await import('./dialog-store.svelte');
    expect(getOldestDialog()).toBeNull();
  });

  it('createDialog registers a dialog accessible via getOldestDialog', async () => {
    const { createDialog, getOldestDialog } = await import('./dialog-store.svelte');
    createDialog((resolve) => ({
      content: { type: 'TestContent' } as any,
      props: { resolve },
      resolve,
    }));
    const entry = getOldestDialog();
    expect(entry).not.toBeNull();
    expect(entry![1].content).toEqual({ type: 'TestContent' });
  });

  it('createDialog returns a promise that resolves when the callback fires', async () => {
    const { createDialog } = await import('./dialog-store.svelte');
    let capturedResolve: ((v: string) => void) | null = null;

    const promise = createDialog<string>((resolve) => {
      capturedResolve = resolve;
      return { content: {} as any, props: {}, resolve };
    });

    capturedResolve!('hello');
    await expect(promise).resolves.toBe('hello');
  });

  it('createDialog removes the dialog after 150 ms', async () => {
    const { createDialog, getOldestDialog } = await import('./dialog-store.svelte');
    let capturedResolve: ((v: void) => void) | null = null;

    createDialog<void>((resolve) => {
      capturedResolve = resolve;
      return { content: {} as any, props: {}, resolve };
    });

    capturedResolve!(undefined);
    expect(getOldestDialog()).not.toBeNull();

    vi.advanceTimersByTime(150);
    expect(getOldestDialog()).toBeNull();
  });

  it('createDialog resolve is idempotent — calling twice resolves only once', async () => {
    const { createDialog } = await import('./dialog-store.svelte');
    let capturedResolve: ((v: number) => void) | null = null;

    const promise = createDialog<number>((resolve) => {
      capturedResolve = resolve;
      return { content: {} as any, props: {}, resolve };
    });

    capturedResolve!(1);
    capturedResolve!(2);
    await expect(promise).resolves.toBe(1);
  });

  it('removeDialog immediately deletes a dialog by id', async () => {
    const { createDialog, getOldestDialog, removeDialog } = await import('./dialog-store.svelte');
    let capturedId: number | null = null;

    // Intercept the id by wrapping createDialog with a resolved-immediately dialog
    const promise = createDialog<void>((resolve) => ({
      content: {} as any,
      props: {},
      resolve,
    }));

    const entry = getOldestDialog();
    expect(entry).not.toBeNull();
    capturedId = entry![0];

    removeDialog(capturedId);
    expect(getOldestDialog()).toBeNull();

    // Ensure promise doesn't reject
    void promise;
  });

  it('multiple dialogs stack; getOldestDialog returns the first created', async () => {
    const { createDialog, getOldestDialog } = await import('./dialog-store.svelte');

    createDialog<void>((resolve) => ({ content: { tag: 'first' } as any, props: {}, resolve }));
    createDialog<void>((resolve) => ({ content: { tag: 'second' } as any, props: {}, resolve }));

    const oldest = getOldestDialog();
    expect((oldest![1].content as any).tag).toBe('first');
  });
});

describe('dialog.confirm / dialog.alert', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('confirm registers a dialog with ConfirmContent', async () => {
    const { dialog, getOldestDialog } = await import('./dialog-store.svelte');
    const { default: DialogConfirmContent } = await import('./dialog-confirm-content.svelte');

    dialog.confirm({ title: 'Are you sure?' });

    const entry = getOldestDialog();
    expect(entry![1].content).toBe(DialogConfirmContent);
  });

  it('alert registers a dialog with AlertContent', async () => {
    const { dialog, getOldestDialog } = await import('./dialog-store.svelte');
    const { default: DialogAlertContent } = await import('./dialog-alert-content.svelte');

    dialog.alert({ title: 'Info', description: 'Something happened' });

    const entry = getOldestDialog();
    expect(entry![1].content).toBe(DialogAlertContent);
  });

  it('confirm close() callback resolves with confirmed=false', async () => {
    const { dialog, getOldestDialog } = await import('./dialog-store.svelte');

    const confirmPromise = dialog.confirm({ title: 'Delete?' });
    const entry = getOldestDialog();
    (entry![1].props as any).close();

    vi.advanceTimersByTime(150);
    const result = await confirmPromise;
    expect(result).toEqual({ confirmed: false });
  });
});
