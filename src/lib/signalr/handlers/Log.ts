import { isNumber, isObject, isString } from '$lib/typeguards';
import { toast } from 'svelte-sonner';

interface ShockerInfo {
  id: string;
  name: string;
}

interface ControlLog {
  shocker: ShockerInfo;
  type: number;
  intensity: number;
  duration: number;
  executedAt: string;
}

interface ControlLogSender {
  connectionId: string;
  additionalItems: { [key: string]: object };
  id: string;
  name: string;
  image: string;
  customName: string | null;
}

function isShockerInfo(value: unknown): value is ShockerInfo {
  return (
    isObject(value) &&
    'id' in value &&
    isString(value.id) &&
    'name' in value &&
    isString(value.name)
  );
}
function isControlLog(value: unknown): value is ControlLog {
  return (
    isObject(value) &&
    'shocker' in value &&
    isShockerInfo(value.shocker) &&
    'type' in value &&
    isNumber(value.type) &&
    'intensity' in value &&
    isNumber(value.intensity) &&
    'duration' in value &&
    isNumber(value.duration) &&
    'executedAt' in value &&
    isString(value.executedAt)
  );
}
function isControlLogSender(value: unknown): value is ControlLogSender {
  return (
    isObject(value) &&
    'connectionId' in value &&
    isString(value.connectionId) &&
    'additionalItems' in value &&
    isObject(value.additionalItems) &&
    Object.values(value.additionalItems).every(isObject) &&
    'id' in value &&
    isString(value.id) &&
    'name' in value &&
    isString(value.name) &&
    'image' in value &&
    isString(value.image) &&
    'customName' in value &&
    (value.customName === null || isString(value.customName))
  );
}

export function handleSignalrLog(sender: unknown, logs: unknown) {
  if (!isControlLogSender(sender) || !Array.isArray(logs) || !logs.every(isControlLog)) {
    console.error('Received invalid SignalR log payload', sender, logs);
    toast.error('Received invalid log data from server!');
    return;
  }

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
    console.log('Type:', log.type);
    console.log('Intensity:', log.intensity);
    console.log('Duration (ms):', log.duration);
    console.groupEnd();
  });

  console.groupEnd();
}
