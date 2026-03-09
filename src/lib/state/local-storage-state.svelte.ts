import { browser } from '$app/environment';

export class LocalStorageState<T> {
  #key: string;
  #default: T;
  #value: T;

  constructor(key: string, defaultValue: T) {
    this.#key = key;
    this.#default = defaultValue;

    const existingValue = browser ? localStorage.getItem(key) : null;
    this.#value = $state<T>(
      existingValue === null ? defaultValue : (JSON.parse(existingValue) as T)
    );
  }

  get value() {
    return this.#value;
  }
  set value(value: T) {
    this.#value = value;
    localStorage.setItem(this.#key, JSON.stringify(value));
  }

  reset() {
    this.#value = this.#default;
    localStorage.removeItem(this.#key);
  }
}
