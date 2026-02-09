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
    AddListener(id, shockerId, onEvent);

    return () => {
      RemoveListener(id);
      clearTimeout(timeoutHandle);
    };
  });
</script>
