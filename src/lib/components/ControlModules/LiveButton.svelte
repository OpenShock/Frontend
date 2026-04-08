<script lang="ts">
  import { Loader } from '@lucide/svelte';
  import {
    type LiveDeviceConnection,
    type LiveShockerState,
    LiveConnectionState,
    toggleShockerLiveControl,
  } from '$lib/state/live-control-state.svelte';

  interface Props {
    hubId: string;
    shockerId: string;
    isPaused: boolean;
    connection?: LiveDeviceConnection;
    liveState?: LiveShockerState;
  }

  let { hubId, shockerId, isPaused, connection, liveState }: Props = $props();

  let isActive = $derived(
    (liveState?.isLive ?? false) && connection?.state === LiveConnectionState.Connected
  );
  let isConnecting = $derived(
    (liveState?.isLive ?? false) && connection?.state === LiveConnectionState.Connecting
  );
  let isDisabled = $derived(isPaused && !(liveState?.isLive ?? false));
</script>

<div class="mb-1 flex items-center gap-1.5">
  <button
    class="border-border text-muted-foreground hover:border-foreground hover:text-foreground cursor-pointer rounded border bg-transparent px-1.5 py-px text-[10px] font-bold tracking-wider transition-all duration-200
      {isActive
      ? 'bg-gradient-to-r from-[rgb(185,123,255)] to-[#e100ff] bg-clip-text text-transparent [border-image:linear-gradient(to_right,rgb(167,89,255),#e100ff)_1]'
      : ''}
      {isConnecting ? 'border-muted-foreground text-muted-foreground' : ''}
      {isDisabled ? 'pointer-events-none opacity-40' : ''}"
    onclick={() => toggleShockerLiveControl(hubId, shockerId)}
    disabled={isDisabled}
    title={isActive
      ? `Live — ${connection?.gateway} (${connection?.country}) — ${connection?.latency}ms`
      : isConnecting
        ? 'Connecting...'
        : 'Connect to Live Control'}
  >
    LIVE
    {#if isConnecting}
      <Loader class="inline size-3 animate-spin" />
    {/if}
  </button>
  {#if isActive && connection}
    <span class="text-muted-foreground text-[10px]">
      {connection.gateway} ({connection.country}) — {connection.latency}ms
    </span>
  {/if}
</div>
