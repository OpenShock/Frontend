import { dev } from '$app/env';
import { isControlLog, type ControlLog } from '$lib/signalr/models/ControlLog';
import { isControlLogSender, type ControlLogSender } from '$lib/signalr/models/ControlLogSender';
import { toast } from 'svelte-sonner';
import { ControlType } from '../models/ControlType';

export type ShockEventListener = (sender: ControlLogSender, log: ControlLog) => void;

type RegisteredListener = {
  id: string;
  shockerId: string | null;
  callback: ShockEventListener;
};

const listeners: RegisteredListener[] = [];

export function addShockEventListener(
  id: string,
  shockerId: string | null,
  callback: ShockEventListener
) {
  listeners.push({ id, shockerId, callback });
}

export function removeShockEventListener(id: string) {
  const idx = listeners.findIndex((l) => l.id === id);
  if (idx !== -1) {
    listeners.splice(idx, 1);
  }
}

function emitShockEvent(sender: ControlLogSender, log: ControlLog) {
  for (const listener of listeners) {
    if (listener.shockerId === null || listener.shockerId === log.shocker.id) {
      listener.callback(sender, log);
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
      console.group(
        `Log #${index + 1} - ${Temporal.Instant.from(log.executedAt).toLocaleString()}`
      );
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
    emitShockEvent(sender, log);
  });
}
