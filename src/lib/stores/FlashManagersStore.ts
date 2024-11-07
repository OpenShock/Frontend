import FlashManager from "$lib/EspTool/FlashManager";
import type { IEspLoaderTerminal } from "esptool-js";
import { get, writable } from "svelte/store";

const { update, subscribe } = writable<FlashManager[]>([]);

async function getManager(port: SerialPort, terminal: IEspLoaderTerminal) {
  let manager = get(FlashManagerStore).find((m) => m.SerialPort === port) ?? null;
  if (manager !== null) {
    return manager;
  }

  console.log("Connecting to", port);

  manager = await FlashManager.Connect(port, terminal);

  if (manager !== null) {
    update((m) => [...m, manager as FlashManager]);
  }

  return manager;
}

async function removeManager(manager: FlashManager) {
  try {
    await manager.disconnect();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // Ignore
  }

  update((m) => {
    return m.filter((m) => m !== manager);
  });
}

function removePort(port: SerialPort) {
  console.log("Removing port", port);
  update((m) => {
    const manager = m.find((m) => m.SerialPort === port);

    if (manager) {
      console.log("Disconnecting manager", manager);
      manager.disconnect(); // Ignored promise
    }

    return m.filter((m) => m !== manager);
  });
}

export const FlashManagerStore = {
  getManager,
  removeManager,
  removePort,
  subscribe,
};

export function initializeFlashManagersStore() {
  if ('serial' in navigator) {
    navigator.serial.addEventListener("disconnect", (e) => removePort(e.target as SerialPort));
  }
}
