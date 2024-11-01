import { type Component, type Snippet } from 'svelte';
import { writable } from 'svelte/store';

export type ModalProps<TArg> = { arg?: TArg, close: () => void };

type SnippetModal<TArg> = Snippet<[ModalProps<TArg>]>;
type ComponentModal<TArg> = Component<ModalProps<TArg>>;

type ModalContext<TArg> = ({
  modal: SnippetModal<TArg>;
  type: 'snippet';
} | {
  modal: ComponentModal<TArg>;
  type: 'component';
}) & {
  arg: TArg | undefined;
};

const { update, subscribe } = writable<ModalContext<unknown>[]>([]);

function pushSnippet<TArg>(snippet: SnippetModal<TArg | null>, arg: TArg | undefined = undefined): void {
  update((state) => {
    state.push({ modal: snippet, type: 'snippet', arg } as ModalContext<unknown>);
    return state;
  });
}

function pushComponent<TArg>(component: ComponentModal<TArg | null>, arg: TArg | undefined = undefined): void {
  update((state) => {
    state.push({ modal: component, type: 'component', arg } as ModalContext<unknown>);
    return state;
  });
}

export const ModalStore = {
  pushSnippet,
  pushComponent,
  subscribe
}
