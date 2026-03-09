import type { ControlType } from '$lib/signalr/models/ControlType';

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

const listeners = $state<EventListener[]>([]);

export function triggerEvent(
  shockerId: string,
  controlType: ControlType,
  duration: number,
  intensity: number
) {
  listeners.forEach((evlistener) => {
    if (evlistener.shockerId === shockerId) {
      evlistener.func(shockerId, controlType, duration, intensity);
    }
  });
}

export function addListener(listenerId: string, shockerId: string, func: ListenerSignature) {
  listeners.push({ listenerId, shockerId, func });
}

export function removeListener(listenerId: string) {
  const idx = listeners.findIndex((listener) => listener.listenerId === listenerId);
  if (idx !== -1) {
    listeners.splice(idx, 1);
  }
}
