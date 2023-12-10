import { writable } from "svelte/store";

export const UserStore = writable<string | null>(null);