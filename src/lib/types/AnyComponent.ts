/* eslint-disable @typescript-eslint/no-explicit-any -- type must accept any component props/events/slots signatures */

import type { Component, SvelteComponent } from 'svelte';

export type AnyComponent =
  | Component<any, any, any>
  | (new (...args: any[]) => SvelteComponent<any, any, any>);
