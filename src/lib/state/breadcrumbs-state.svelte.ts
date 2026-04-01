import type { Pathname } from '$app/types';
import { onMount } from 'svelte';

export interface BreadcrumbEntry {
  label: string;
  href: Pathname | null;
}

interface BreadcrumbSlot {
  id: symbol;
  entries: BreadcrumbEntry[];
}

let _slots = $state<BreadcrumbSlot[]>([]);

export const breadcrumbs = {
  get state(): BreadcrumbEntry[] {
    return _slots.flatMap((s) => s.entries);
  },
};

export function registerBreadcrumbs(
  entriesFn: () => Array<{ label: string; href?: Pathname | null }>
): void {
  const id = Symbol();
  _slots.push({ id, entries: [] });

  $effect(() => {
    const slot = _slots.find((s) => s.id === id);
    if (slot) {
      slot.entries = entriesFn().map((e) => ({ label: e.label, href: e.href ?? null }));
    }
  });

  onMount(() => () => {
    const idx = _slots.findIndex((s) => s.id === id);
    if (idx !== -1) _slots.splice(idx, 1);
  });
}
