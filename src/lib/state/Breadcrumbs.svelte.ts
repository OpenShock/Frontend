import type { Pathname } from '$app/types';
import { onMount } from 'svelte';

export interface BreadCrumbEntry {
  text: string;
  href: Pathname | null;
}

let state = $state<BreadCrumbEntry[]>([]);

export const breadcrumbs = {
  get State() {
    return state;
  },
  push: (text: string, href: Pathname | null = null) => {
    onMount(() => {
      const entry = { text, href };
      state = [...state, entry];
      return () => {
        state = state.filter((e) => e.text !== entry.text || e.href !== entry.href);
      };
    });
  },
  clear: () => state = [],
};