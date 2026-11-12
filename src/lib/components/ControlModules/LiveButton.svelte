<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import * as Tooltip from '@openshock/svelte-core/components/ui/tooltip';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner';
  import {
    LiveConnectionState,
    getLiveConnection,
    setHubLiveControl,
    toggleShockerLiveControl,
  } from '#lib/state/live-control-state.svelte.js';

  interface Props {
    hubId: string;
    shockerId: string;
    compact?: boolean;
  }

  let { hubId, shockerId, compact = false }: Props = $props();

  let connection = $derived(getLiveConnection(hubId));
  let liveState = $derived(connection?.getShockerState(shockerId));

  let isLive = $derived(liveState?.isLive ?? false);
  let isPaused = $derived(liveState?.isPaused ?? false);
  let hubIsLive = $derived(
    connection ? [...connection.shockers.values()].some((s) => s.isLive) : false
  );
  let isActive = $derived(isLive && connection?.state === LiveConnectionState.Connected);
  let isConnecting = $derived(isLive && connection?.state === LiveConnectionState.Connecting);
  let isDisabled = $derived(isPaused && !isLive);

  function onClick(event: MouseEvent) {
    if (event.ctrlKey || event.metaKey) {
      setHubLiveControl(hubId, !hubIsLive);
    } else {
      toggleShockerLiveControl(hubId, shockerId);
    }
  }
</script>

<div class="flex items-center gap-1.5 {compact ? '' : 'mb-1'}">
  <Tooltip.Root>
    <Tooltip.Trigger
      onclick={onClick}
      disabled={isDisabled}
      class="border-border text-muted-foreground hover:border-foreground hover:text-foreground cursor-pointer rounded border bg-transparent px-1.5 py-px text-[10px] font-bold tracking-wider transition-all duration-200
        {isActive
        ? 'bg-linear-to-r from-[rgb(185,123,255)] to-[#e100ff] bg-clip-text text-transparent [border-image:linear-gradient(to_right,rgb(167,89,255),#e100ff)_1]'
        : ''}
        {isConnecting ? 'border-muted-foreground text-muted-foreground' : ''}
        {isDisabled ? 'pointer-events-none opacity-40' : ''}"
    >
      LIVE
      {#if isConnecting}
        <Spinner class="inline size-3" />
      {/if}
    </Tooltip.Trigger>
    <Tooltip.Content>
      <div class="flex flex-col gap-0.5 text-xs">
        <span>
          {#if isActive}
            {m.live_tooltip_active({
              gateway: connection?.gateway ?? '',
              country: connection?.country ?? '',
              latency: connection?.latency ?? 0,
            })}
          {:else if isConnecting}
            {m.live_tooltip_connecting()}
          {:else}
            {m.live_tooltip_connect()}
          {/if}
        </span>
        <span class="text-muted-foreground">
          {hubIsLive ? m.live_tooltip_hub_stop() : m.live_tooltip_hub_start()}
        </span>
      </div>
    </Tooltip.Content>
  </Tooltip.Root>
  {#if isActive && connection && !compact}
    <span class="text-muted-foreground text-[10px]">
      {connection.gateway} ({connection.country}), {connection.latency}ms
    </span>
  {/if}
</div>
