import { writable } from 'svelte/store';

export const IsAuthenticated = writable<boolean | undefined>();
