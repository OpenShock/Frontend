// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

/// <reference types="svelte" />
/// <reference types="vite/client" />

import type { TurnstileInstance } from "$lib/types/TurnstileInstance";

declare global {
  declare namespace App {
    // interface Locals {}
    // interface PageData {}
    // interface Error {}
    // interface Platform {}
  }
  declare interface Window {
    turnstile: TurnstileInstance | undefined;
  }
}

export { };
