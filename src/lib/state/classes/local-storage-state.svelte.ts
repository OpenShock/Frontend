import { browser } from '$app/environment';

export class LocalStorageState<T> {
  readonly key: string;
  readonly defaultValue: T;
  #value: T;

  constructor(key: string, defaultValue: T) {
    this.key = key;
    this.defaultValue = defaultValue;

    const raw = browser ? localStorage.getItem(key) : null;
    this.#value = $state<T>(raw === null ? defaultValue : this.deserialize(raw));
  }

  get value() {
    return this.#value;
  }
  set value(value: T) {
    this.#value = value;
    if (browser) localStorage.setItem(this.key, this.serialize(value));
  }

  reset() {
    this.#value = this.defaultValue;
    if (browser) localStorage.removeItem(this.key);
  }

  protected serialize(value: T): string {
    return JSON.stringify(value);
  }

  protected deserialize(raw: string): T {
    return JSON.parse(raw) as T;
  }
}
