export type ButtonSettings =
  | { text: string; class?: string; submits?: boolean; onClick: () => void }
  | { icon: `fa-${string}`; class?: string; submits?: boolean; onClick: () => void };
