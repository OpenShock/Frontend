import { addShockEventListener, removeShockEventListener } from '$lib/signalr/handlers/Log';
import type { ControlType } from '$lib/signalr/models/ControlType';
import type { TimeoutHandle } from '$lib/types/WAPI';
import { onMount } from 'svelte';

/**
 * Subscribes to shock events for a specific shocker, scoped to the component lifecycle.
 * Returns reactive `active` state that tracks the current control type and auto-clears after duration.
 */
export function useShockerEvents(shockerId: () => string) {
  let active = $state<ControlType | null>(null);
  let timeoutHandle: TimeoutHandle | undefined;

  onMount(() => {
    const id = crypto.randomUUID();
    addShockEventListener(id, shockerId(), (_sid, controlType, duration) => {
      clearTimeout(timeoutHandle);
      active = controlType;
      timeoutHandle = setTimeout(() => (active = null), duration);
    });

    return () => {
      removeShockEventListener(id);
      clearTimeout(timeoutHandle);
    };
  });

  return {
    get active() {
      return active;
    },
  };
}
