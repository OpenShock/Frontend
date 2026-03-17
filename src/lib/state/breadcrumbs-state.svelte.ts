import type { Pathname } from '$app/types';
import { onMount } from 'svelte';

export interface BreadCrumbEntry {
  text: string;
  href: Pathname | null;
}

let _state = $state<BreadCrumbEntry[]>([]);

export const breadcrumbs = {
  get state() {
    return _state;
  },
  push: (text: string, href: Pathname | null = null) => {
    onMount(() => {
      const entry = { text, href };
      _state = [..._state, entry];
      return () => {
        _state = _state.filter((e) => e.text !== entry.text || e.href !== entry.href);
      };
    });
  },
  clear: () => (_state = []),
};
