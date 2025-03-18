<script lang="ts">
  import * as ToggleGroup from '$lib/components/ui/toggle-group';
  import {
    GetFirmwareChannel,
    GetChannelBoards,
    type ChannelDict,
    type Channel,
  } from '$lib/api/firmwareCDN';

  import { CircleCheckBig, TriangleAlert } from '@lucide/svelte';

  /** Optional chip to constrain the list of boards to */
  //export let chip: string | null = null;
  interface Props {
    version: string | null;
    disabled?: boolean;
  }

  let { version = $bindable(null), disabled = false }: Props = $props();

  let selectedChannel = $state<Channel>('stable');

  let channels = $state<ChannelDict>({});
  GetFirmwareChannel().then((c) => (channels = c));

  let boardsCache = $state<{ [key: string]: string[] }>({});
  $effect(() => {
    version = channels[selectedChannel] ?? null;

    if (version && !(version in boardsCache)) {
      let requestedVersion = version;
      GetChannelBoards(version).then((b) => {
        boardsCache = { ...boardsCache, [requestedVersion]: b ?? [] };
      });
    }
  });
</script>

<div class="flex flex-row items-center justify-start gap-2">
  <ToggleGroup.Root type="single" bind:value={selectedChannel} {disabled}>
    {#each Object.keys(channels) as key}
      <ToggleGroup.Item value={key} {disabled}>
        {key.charAt(0).toUpperCase() + key.slice(1)}
      </ToggleGroup.Item>
    {/each}
  </ToggleGroup.Root>

  <div class="flex flex-row items-center justify-start gap-2 pl-2">
    {#if selectedChannel === 'stable'}
      <CircleCheckBig color="#22c55e" />
      <p class="text-green-500">This is the recommended channel.</p>
    {:else if selectedChannel === 'beta'}
      <TriangleAlert color="#eab308" />
      <p class="text-yellow-500">This channel might contain bugs.</p>
    {:else}
      <TriangleAlert color="#ef4444" />
      <p class="text-red-500">Avoid this channel unless you know what you're doing.</p>
    {/if}
  </div>
</div>
