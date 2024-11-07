<script lang="ts">
  import { GetFirmwareChannel, GetChannelBoards, type ChannelDict, type Channel } from './CDN';

  /** Optional chip to constrain the list of boards to */
  //export let chip: string | null = null;
  interface Props {
    version?: string | null;
    board?: string | null;
    disabled?: boolean;
  }

  let { version = $bindable(null), board = $bindable(null), disabled = false }: Props = $props();

  let selectedChannel: Channel = $state('stable');

  let channels: ChannelDict = $state({});
  GetFirmwareChannel().then((c) => (channels = c));

  let boardsCache: { [key: string]: string[] } = $state({});
  $effect(() => {
    version = channels[selectedChannel] ?? null;

    if (version && !(version in boardsCache)) {
      let requestedVersion = version;
      GetChannelBoards(version).then((b) => {
        boardsCache = { ...boardsCache, [requestedVersion]: b ?? [] };
      });
    }
  });

  let boards = $derived(version ? (boardsCache[version] ?? []) : []);
  $effect(() => {
    if (boards.length === 0) {
      board = null;
    }
  });
</script>

<div class="flex flex-col items-stretch justify-start gap-1">
  <span class="h3 font-bold">Select Channel</span>
  <!--
  <RadioGroup active="variant-filled-primary" hover="hover:variant-soft-primary">
    {#each Channels as key}
      <RadioItem bind:group={selectedChannel} name="justify" value={key} {disabled}>
        {key.charAt(0).toUpperCase() + key.slice(1)}
      </RadioItem>
    {/each}
  </RadioGroup>
  -->

  <div class="flex flex-row items-center justify-start gap-2 pl-2">
    {#if selectedChannel === 'stable'}
      <i class="fa fa-check-circle text-green-500"></i>
      <p class="text-green-500">This is the recommended channel.</p>
    {:else if selectedChannel === 'beta'}
      <i class="fa fa-exclamation-triangle text-yellow-500"></i>
      <p class="text-yellow-500">This channel might contain bugs.</p>
    {:else}
      <i class="fa fa-exclamation-triangle text-red-500"></i>
      <p class="text-red-500">Avoid this channel unless you know what you're doing.</p>
    {/if}
  </div>
</div>

<label class="label">
  <span class="h3 font-bold">Select Board</span>
  <select class="select" bind:value={board} {disabled}>
    {#each boards as board}
      <option value={board}>{board.replaceAll('-', ' ')}</option>
    {/each}
  </select>
</label>
