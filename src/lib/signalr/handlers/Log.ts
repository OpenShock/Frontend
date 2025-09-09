import { dev } from '$app/environment';
import { isControlLog } from '$lib/signalr/models/ControlLog';
import { isControlLogSender } from '$lib/signalr/models/ControlLogSender';
import { TriggerEvent } from '$lib/stores/ShockEventListenerStore';
import { toast } from 'svelte-sonner';
import { ControlType } from '../models/ControlType';

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
    TriggerEvent(log.shocker.id, log.type, log.duration, log.intensity);
  });
}
