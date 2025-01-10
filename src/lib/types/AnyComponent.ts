import type { Component, SvelteComponent } from "svelte";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyComponent = Component<any, any, any> | (new (...args: any[]) => SvelteComponent<any, any, any>);
