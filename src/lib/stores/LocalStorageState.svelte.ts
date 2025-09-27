import { browser } from '$app/environment';

export class LocaleStorageState<T> {
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

  get Value() {
    return this.#value;
  }
  set Value(value: T) {
    this.#value = value;
    localStorage.setItem(this.#key, JSON.stringify(value));
  }

  Reset() {
    this.#value = this.#default;
    localStorage.removeItem(this.#key);
  }
}
