import { browser } from '$app/environment';
import { onDestroy } from 'svelte';

export type StorageType = 'local' | 'session';

export interface LocalStorageStateOptions {
  /** Which Web Storage area to persist to. Defaults to `'local'`. */
  storage?: StorageType;
}

const mockStorage: Storage = {
  length: 0,
  clear: () => {},
  getItem: () => null,
  key: () => null,
  removeItem: () => {},
  setItem: () => {},
};

export class PersistedState<T> {
  readonly #key: string;
  readonly defaultValue: T;
  readonly #storage: Storage;
  #value: T;

  constructor(key: string, defaultValue: T, options: LocalStorageStateOptions = {}) {
    this.#key = key;
    this.defaultValue = defaultValue;
    this.#storage = browser
      ? options.storage === 'session'
        ? sessionStorage
        : localStorage
      : mockStorage;

    this.#value = $state<T>(this.deserialize(this.#storage.getItem(key)));

    // Only localStorage fires storage events across tabs; sessionStorage is tab-scoped.
    if (browser && options.storage !== 'session') {
      window.addEventListener('storage', this.#onStorage);
    }
  }

  /** Detach the cross-tab `storage` listener. No-op if none was attached. */
  dispose() {
    if (this.#storage === localStorage) {
      if (browser) window.removeEventListener('storage', this.#onStorage);
    }
  }

  #onStorage = (event: StorageEvent) => {
    if (event.storageArea !== this.#storage) return;
    if (event.key !== this.#key) return;
    this.#update(this.deserialize(event.newValue));
  };

  #update(value: T) {
    this.#value = value;
    this.onChange(value);
  }

  get value() {
    return this.#value;
  }
  set value(value: T) {
    this.#update(value);
    this.#storage.setItem(this.#key, this.serialize(value));
  }

  reset() {
    this.#update(this.defaultValue);
    this.#storage.removeItem(this.#key);
  }

  /** Hook called whenever the value changes, regardless of source (setter, reset, or storage event). */
  protected onChange(_value: T): void {}

  protected serialize(value: T): string {
    return JSON.stringify(value);
  }

  protected deserialize(raw: string | null): T {
    if (raw === null) return this.defaultValue;
    return JSON.parse(raw) as T;
  }
}

/** Component-aware `PersistedState` that detaches the storage listener on unmount. */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  options?: LocalStorageStateOptions
): PersistedState<T> {
  const state = new PersistedState(key, defaultValue, options);
  onDestroy(() => state.dispose());
  return state;
}
