import type { Component, SvelteComponent } from 'svelte';

 
export type AnyComponent =
  | Component<any, any, any>
  | (new (...args: any[]) => SvelteComponent<any, any, any>);
