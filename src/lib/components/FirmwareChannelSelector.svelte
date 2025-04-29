<script lang="ts">
  import * as ToggleGroup from '$lib/components/ui/toggle-group';
  import { FetchChannelVersion, FirmwareChannels, type FirmwareChannel } from '$lib/api/firmwareCDN';

  import { CircleCheckBig, TriangleAlert } from '@lucide/svelte';

  /** Optional chip to constrain the list of boards to */
  //export let chip: string | null = null;
  interface Props {
    channel?: FirmwareChannel;
    version?: string | null;
    disabled?: boolean;
  }

  let {
    channel = $bindable<FirmwareChannel>('stable'),
    version = $bindable(null),
    disabled = false,
  }: Props = $props();

  let versions = $state<{ [key in FirmwareChannel]?: string | null }>({});

  // Reactive effect to update the version based on the selected channel.
  $effect(() => {
    // Ensure channel is valid; if missing or empty, default to 'stable'
    if (!channel || channel.trim().length === 0) {
      channel = 'stable';
    }

    // Use a cached value if available.
    const cachedVersion = versions[channel];
    if (cachedVersion !== undefined) {
      version = cachedVersion;
      return;
    }

    // Capture the current channel to avoid race conditions if channel changes.
    const currentChannel = channel;

    // Fetch the channel version from the API.
    FetchChannelVersion(currentChannel)
      .then(ver => {
        version = ver ?? null;
        versions[currentChannel] = version;
      });
  });
</script>

<div class="flex flex-row items-center justify-start gap-2">
  <ToggleGroup.Root type="single" bind:value={channel} {disabled}>
    {#each FirmwareChannels as key}
      <ToggleGroup.Item class="cursor-pointer capitalize" value={key} {disabled}>
        {key}
      </ToggleGroup.Item>
    {/each}
  </ToggleGroup.Root>

  <div class="flex flex-row items-center justify-start gap-2 pl-2">
    {#if channel === 'stable'}
      <CircleCheckBig color="#22c55e" />
      <p class="text-green-500">This is the recommended channel.</p>
    {:else if channel === 'beta'}
      <TriangleAlert color="#eab308" />
      <p class="text-yellow-500">This channel might contain bugs.</p>
    {:else}
      <TriangleAlert color="#ef4444" />
      <p class="text-red-500">Avoid this channel unless you know what you're doing.</p>
    {/if}
  </div>
</div>
