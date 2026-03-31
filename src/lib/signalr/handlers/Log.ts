import { dev } from '$app/environment';
import { isControlLog } from '$lib/signalr/models/ControlLog';
import { isControlLogSender } from '$lib/signalr/models/ControlLogSender';
import { toast } from 'svelte-sonner';
import { ControlType } from '../models/ControlType';

export type ShockEventListener = (
  shockerId: string,
  controlType: ControlType,
  duration: number,
  intensity: number
) => void;

type RegisteredListener = {
  id: string;
  shockerId: string;
  callback: ShockEventListener;
};

const listeners: RegisteredListener[] = [];

export function addShockEventListener(id: string, shockerId: string, callback: ShockEventListener) {
  listeners.push({ id, shockerId, callback });
}

export function removeShockEventListener(id: string) {
  const idx = listeners.findIndex((l) => l.id === id);
  if (idx !== -1) {
    listeners.splice(idx, 1);
  }
}

function emitShockEvent(
  shockerId: string,
  controlType: ControlType,
  duration: number,
  intensity: number
) {
  for (const listener of listeners) {
    if (listener.shockerId === shockerId) {
      listener.callback(shockerId, controlType, duration, intensity);
    }
  }
}

export function handleSignalrLog(sender: unknown, logs: unknown) {
  if (!isControlLogSender(sender) || !Array.isArray(logs) || !logs.every(isControlLog)) {
    console.error('Received invalid SignalR log payload', sender, logs);
    toast.error('Received invalid log data from server!');
    return;
  }

  if (dev) {
    console.groupCollapsed(`SignalR Log from ${sender.customName ?? sender.name} (${sender.id})`);
    console.log(`Connection ID: ${sender.connectionId}`);

    // Log any additional custom items
    if (Object.keys(sender.additionalItems).length > 0) {
      console.group('Additional Items');
      for (const [key, value] of Object.entries(sender.additionalItems)) {
        console.log(`${key}:`, value);
      }
      console.groupEnd();
    }

    // Iterate through each control log
    logs.forEach((log, index) => {
      console.group(`Log #${index + 1} - ${new Date(log.executedAt).toLocaleString()}`);
      console.log('Shocker:', `${log.shocker.name} (${log.shocker.id})`);
      console.log('Type:', ControlType[log.type]);
      if (log.type !== ControlType.Stop) {
        console.log('Intensity:', log.intensity);
        console.log('Duration (ms):', log.duration);
      }
      console.groupEnd();
    });

    console.groupEnd();
  }

  logs.forEach((log) => {
    emitShockEvent(log.shocker.id, log.type, log.duration, log.intensity);
  });
}
