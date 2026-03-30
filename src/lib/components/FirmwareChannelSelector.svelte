<script lang="ts">
  import { CircleCheckBig, TriangleAlert } from '@lucide/svelte';
  import {
    FetchLatest,
    type FirmwareChannel,
    FirmwareChannels,
    type FirmwareLatestResponse,
  } from '$lib/api/firmwareRepo';
  import * as ToggleGroup from '$lib/components/ui/toggle-group';

  interface Props {
    channel?: FirmwareChannel;
    version?: string | null;
    latestResponse?: FirmwareLatestResponse | null;
    disabled?: boolean;
  }

  let {
    channel = $bindable<FirmwareChannel>('stable'),
    version = $bindable(null),
    latestResponse = $bindable(null),
    disabled = false,
  }: Props = $props();

  let cache = $state<{ [key in FirmwareChannel]?: FirmwareLatestResponse | null }>({});

  // Reactive effect to update the version based on the selected channel.
  $effect(() => {
    // Ensure channel is valid; if missing or empty, default to 'stable'
    if (!channel || channel.trim().length === 0) {
      channel = 'stable';
    }

    // Use a cached value if available.
    const cached = cache[channel];
    if (cached !== undefined) {
      latestResponse = cached;
      version = cached?.version ?? null;
      return;
    }

    // Capture the current channel to avoid race conditions if channel changes.
    const currentChannel = channel;

    // Fetch the latest firmware info from the repository server.
    FetchLatest(currentChannel)
      .then((resp) => {
        latestResponse = resp;
        version = resp.version;
        cache[currentChannel] = resp;
      })
      .catch(() => {
        latestResponse = null;
        version = null;
        cache[currentChannel] = null;
      });
  });
</script>

<div class="flex flex-row items-center justify-start gap-2">
  <ToggleGroup.Root type="single" bind:value={channel} {disabled}>
    {#each FirmwareChannels as key (key)}
      <ToggleGroup.Item class="cursor-pointer capitalize" value={key} {disabled}>
        {key}
      </ToggleGroup.Item>
    {/each}
  </ToggleGroup.Root>

  <div class="flex flex-row items-center justify-start gap-2 pl-2">
    {#if channel === 'stable'}
      <CircleCheckBig color="#22c55e" />
      <p class="text-green-500">This is the recommended channel.</p>
      <!--
    {:else if channel === 'beta'}
      <TriangleAlert color="#eab308" />
      <p class="text-yellow-500">This channel might contain bugs.</p>
    -->
    {:else}
      <TriangleAlert color="#ef4444" />
      <p class="font-bold text-red-500" role="alert">
        DO NOT USE THIS UNLESS YOU KNOW WHAT YOU ARE DOING
      </p>
    {/if}
  </div>
</div>
