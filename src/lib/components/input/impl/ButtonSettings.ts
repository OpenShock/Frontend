import type { AnyComponent } from '$lib/types/AnyComponent';

export type ButtonSettings =
  | { text: string; class?: string; submits?: boolean; onClick: () => void }
  | { Icon: AnyComponent; class?: string; submits?: boolean; onClick: () => void };
