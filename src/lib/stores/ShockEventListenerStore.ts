import type { ControlType } from '$lib/signalr/models/ControlType';
import { get, writable } from 'svelte/store';

export type ListenerSignature = (
  shockerId: string,
  controlType: ControlType,
  duration: number,
  intensity: number
) => void;

type EventListener = {
  listenerId: string;
  shockerId: string;
  func: ListenerSignature;
};

const ShockEventListeners = writable<EventListener[]>([]);

export function TriggerEvent(
  shockerId: string,
  controlType: ControlType,
  duration: number,
  intensity: number
) {
  get(ShockEventListeners).forEach((evlistener) => {
    if (evlistener.shockerId === shockerId) {
      evlistener.func(shockerId, controlType, duration, intensity);
    }
  });
}

export function AddListener(listenerId: string, shockerId: string, func: ListenerSignature) {
  ShockEventListeners.update((listeners) => {
    listeners.push({
      listenerId,
      shockerId,
      func,
    });

    return listeners;
  });
}

export function RemoveListener(listenerId: string) {
  ShockEventListeners.update((listeners) => {
    const idx = listeners.findIndex((listener) => listener.listenerId === listenerId);
    if (idx !== -1) {
      listeners.splice(idx, 1);
    }

    return listeners;
  });
}
