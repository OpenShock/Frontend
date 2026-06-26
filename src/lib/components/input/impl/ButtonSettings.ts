import type { AnyComponent } from '@openshock/svelte-core/types/AnyComponent';

export type ButtonSettings =
  | { text: string; class?: string; submits?: boolean; onClick: () => void }
  | { Icon: AnyComponent; class?: string; submits?: boolean; onClick: () => void };
