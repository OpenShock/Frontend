import { writable } from 'svelte/store';

export interface BreadCrumbEntry {
  text: string;
  href?: string;
}

export const BreadCrumbStore = writable<BreadCrumbEntry[]>([]);
