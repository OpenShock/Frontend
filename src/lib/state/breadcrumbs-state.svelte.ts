import type { Path } from '$app/types';
import { onDestroy, untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

export interface BreadcrumbEntry {
  label: string;
  href: Path | null;
}

const _slots = new SvelteMap<symbol, BreadcrumbEntry[]>();

export const breadcrumbs = {
  get state(): BreadcrumbEntry[] {
    return Array.from(_slots.values()).flat();
  },
};

export function registerBreadcrumbs(
  entriesFn: () => Array<{ label: string; href?: Path | null }>
): void {
  const id = Symbol();
  _slots.set(id, []);

  $effect(() => {
    const entries = entriesFn().map((e) => ({ label: e.label, href: e.href ?? null }));
    untrack(() => {
      _slots.set(id, entries);
    });
  });

  onDestroy(() => {
    _slots.delete(id);
  });
}
