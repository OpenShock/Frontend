<script lang="ts">
  import { ControlType } from '$lib/signalr/models/ControlType';
  import {
    addListener,
    type ListenerSignature,
    removeListener,
  } from '$lib/state/shock-events-state.svelte';
  import type { TimeoutHandle } from '$lib/types/WAPI';
  import { onMount } from 'svelte';

  interface Props {
    shockerId: string;
    active: ControlType | null;
  }

  const id = $props.id();
  let { shockerId, active = $bindable() }: Props = $props();

  let timeoutHandle: TimeoutHandle | undefined;

  const onEvent: ListenerSignature = (sid, controlType, duration, intensity) => {
    clearTimeout(timeoutHandle);

    active = controlType;

    timeoutHandle = setTimeout(() => (active = null), duration);
  };

  onMount(() => {
    addListener(id, shockerId, onEvent);

    return () => {
      removeListener(id);
      clearTimeout(timeoutHandle);
    };
  });
</script>
