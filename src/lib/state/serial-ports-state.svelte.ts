import { isSerialSupported } from '$lib/utils/compatibility';

const ports = $state<SerialPort[]>([]);

let initialized = false;

function addPort(port: SerialPort) {
  if (!ports.includes(port)) {
    ports.push(port);
  }
}
function removePort(port: SerialPort) {
  const idx = ports.indexOf(port);
  if (idx !== -1) {
    ports.splice(idx, 1);
  }
}

function ensureInitialized() {
  if (initialized || !isSerialSupported) return;
  initialized = true;

  navigator.serial.addEventListener('connect', (e) => addPort(e.target as SerialPort));
  navigator.serial.addEventListener('disconnect', (e) => removePort(e.target as SerialPort));

  navigator.serial
    .getPorts()
    .then((existingPorts) => {
      for (const p of existingPorts) {
        addPort(p);
      }
    })
    .catch((error) => {
      console.error('Failed to get ports', error);
    });
}

export const serialPortsState = {
  get ports() {
    ensureInitialized();
    return ports;
  },
  requestPort: async (options: SerialPortRequestOptions) => {
    if (!isSerialSupported) return null;
    ensureInitialized();

    const port = await navigator.serial.requestPort(options);

    addPort(port);

    return port;
  },
};
