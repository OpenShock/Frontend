import { isSerialSupported } from '$lib/utils/compatibility';
import { onMount } from 'svelte';

export class SerialContext {
  #ports = $state<SerialPort[]>([]);
  #onConnect: (e: Event) => void;
  #onDisconnect: (e: Event) => void;

  constructor() {
    this.#onConnect = (e) => this.#addPort(e.target as SerialPort);
    this.#onDisconnect = (e) => this.#removePort(e.target as SerialPort);

    if (isSerialSupported) {
      navigator.serial.addEventListener('connect', this.#onConnect);
      navigator.serial.addEventListener('disconnect', this.#onDisconnect);

      navigator.serial
        .getPorts()
        .then((existing) => {
          for (const p of existing) {
            this.#addPort(p);
          }
        })
        .catch((error) => {
          console.error('Failed to get serial ports', error);
        });
    }
  }

  get ports(): readonly SerialPort[] {
    return this.#ports;
  }

  async requestPort(options: SerialPortRequestOptions): Promise<SerialPort | null> {
    if (!isSerialSupported) return null;

    const port = await navigator.serial.requestPort(options);
    this.#addPort(port);
    return port;
  }

  destroy() {
    if (isSerialSupported) {
      navigator.serial.removeEventListener('connect', this.#onConnect);
      navigator.serial.removeEventListener('disconnect', this.#onDisconnect);
    }
    for (const port of this.#ports) {
      port.close().catch(() => {});
    }
    this.#ports.length = 0;
  }

  #addPort(port: SerialPort) {
    if (!this.#ports.includes(port)) {
      this.#ports.push(port);
    }
  }

  #removePort(port: SerialPort) {
    const idx = this.#ports.indexOf(port);
    if (idx !== -1) {
      this.#ports.splice(idx, 1);
    }
  }
}

/**
 * Creates a SerialContext scoped to the current component's lifetime.
 * Must be called during component initialization (top-level script).
 * Automatically cleans up event listeners on unmount.
 */
export function useSerial(): SerialContext | null {
  if (!isSerialSupported) {
    return null;
  }

  const ctx = new SerialContext();
  onMount(() => () => ctx.destroy());
  return ctx;
}
