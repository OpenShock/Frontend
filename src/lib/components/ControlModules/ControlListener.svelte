<script lang="ts">
  import { ControlType } from '$lib/signalr/models/ControlType';
  import {
    AddListener,
    type ListenerSignature,
    RemoveListener,
  } from '$lib/stores/ShockEventListenerStore';
  import type { TimeoutHandle } from '$lib/types/WAPI';
  import { onMount } from 'svelte';

  interface Props {
    shockerId: string;
    state: ShockerState;
  }

  export interface ShockerState {
    active: ControlType | null;
    intensity: number;
    duration: number;
  }

  const id = $props.id();
  let { shockerId, state = $bindable() }: Props = $props();

  let timeoutHandle: TimeoutHandle | undefined;

  const onEvent: ListenerSignature = (sid, controlType, duration, intensity) => {
    clearTimeout(timeoutHandle);

    state.active = controlType;
    state.intensity = intensity;
    state.duration = duration;

    timeoutHandle = setTimeout(() => (state.active = null), duration);
  };

  onMount(() => {
    AddListener(id, shockerId, onEvent);

    return () => {
      RemoveListener(id);
      clearTimeout(timeoutHandle);
    };
  });
</script>
