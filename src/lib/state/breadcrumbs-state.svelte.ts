import type { Pathname } from '$app/types';
import { onMount } from 'svelte';

export class BreadCrumbEntry {
  label = $state<string>('');
  href: Pathname | null;

  constructor(label: string, href: Pathname | null) {
    this.label = label;
    this.href = href;
  }
}

let _state = $state<BreadCrumbEntry[]>([]);

export const breadcrumbs = {
  get state() {
    return _state;
  },
  push: (label: string, href: Pathname | null = null): BreadCrumbEntry => {
    const entry = new BreadCrumbEntry(label, href);
    onMount(() => {
      _state = [..._state, entry];
      return () => {
        _state = _state.filter((e) => e !== entry);
      };
    });
    return entry;
  },
  clear: () => (_state = []),
};
