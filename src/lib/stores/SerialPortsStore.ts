import { isSerialSupported } from '$lib/utils/compatibility';
import { writable } from 'svelte/store';

const { update, subscribe } = writable<SerialPort[]>([]);

function addPort(port: SerialPort) {
  update((p) => [...p, port]);
}
function removePort(port: SerialPort) {
  update((p) => p.filter((p) => p !== port));
}

export const SerialPortsStore = {
  requestPort: async (options: SerialPortRequestOptions) => {
    if (!isSerialSupported) return null;

    const port = await navigator.serial.requestPort(options);

    addPort(port);

    return port;
  },
  subscribe,
};

export function initializeSerialPortsStore() {
  if (!isSerialSupported) return;

  navigator.serial.addEventListener('connect', (e) => addPort(e.target as SerialPort));
  navigator.serial.addEventListener('disconnect', (e) => removePort(e.target as SerialPort));

  navigator.serial
    .getPorts()
    .then((ports) => {
      if (ports.length > 0) {
        update((p) => [...p, ...ports]);
      }
    })
    .catch((error) => {
      console.error('Failed to get ports', error); // TODO: Show toast
    });
}
