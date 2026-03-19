import type { Pathname } from '$app/types';
import { onMount } from 'svelte';

export interface BreadCrumbEntry {
  label: string;
  href: Pathname | null;
}

let _state = $state<BreadCrumbEntry[]>([]);

export const breadcrumbs = {
  get state() {
    return _state;
  },
  push: (label: string, href: Pathname | null = null) => {
    onMount(() => {
      const entry = { label, href };
      _state = [..._state, entry];
      return () => {
        _state = _state.filter((e) => e.label !== entry.label);
      };
    });
  },
  clear: () => (_state = []),
};
