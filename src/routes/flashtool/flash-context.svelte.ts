import type { IEspLoaderTerminal } from 'esptool-js';
import { onMount } from 'svelte';
import FlashManager from './FlashManager';

export class FlashContext {
  #manager = $state<FlashManager | null>(null);
  #connectFailed = $state(false);
  #isFlashing = $state(false);
  #terminal: IEspLoaderTerminal;

  constructor(terminal: IEspLoaderTerminal) {
    this.#terminal = terminal;
  }

  get manager(): FlashManager | null {
    return this.#manager;
  }

  get connectFailed(): boolean {
    return this.#connectFailed;
  }

  get isFlashing(): boolean {
    return this.#isFlashing;
  }

  set isFlashing(value: boolean) {
    this.#isFlashing = value;
  }

  async connect(port: SerialPort): Promise<void> {
    this.#connectFailed = false;
    const m = await FlashManager.ConnectBootloader(port, this.#terminal);
    this.#manager = m;
    this.#connectFailed = !m;
  }

  async disconnect(): Promise<void> {
    if (this.#manager) {
      await this.#manager.disconnect();
      this.#manager = null;
    }
  }

  destroy(): void {
    this.#manager?.disconnect();
    this.#manager = null;
  }
}

/**
 * Creates a FlashContext scoped to the current component's lifetime.
 * Must be called during component initialization (top-level script).
 * Automatically disconnects on unmount.
 */
export function useFlashManager(terminal: IEspLoaderTerminal): FlashContext {
  const ctx = new FlashContext(terminal);
  onMount(() => () => ctx.destroy());
  return ctx;
}
