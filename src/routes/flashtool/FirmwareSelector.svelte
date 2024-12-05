<script lang="ts">
  import * as ToggleGroup from '$lib/components/ui/toggle-group';
  import { GetFirmwareChannel, GetChannelBoards, type ChannelDict, type Channel } from '$lib/api/firmwareCDN';
  import { Popover, PopoverTrigger, PopoverContent } from '$lib/components/ui/popover';
  import { Button } from '$lib/components/ui/button';
  import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '$lib/components/ui/command';
  import { cn } from '$lib/utils';
  
  import { Check, ChevronsUpDown } from 'lucide-svelte';

  /** Optional chip to constrain the list of boards to */
  //export let chip: string | null = null;
  interface Props {
    version?: string | null;
    selectedBoard?: string | null;
    disabled?: boolean;
  }

  let { version = $bindable(null), selectedBoard = $bindable(null), disabled = false }: Props = $props();

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

  let boards = $derived(version ? (boardsCache[version] ?? []) : []);
  $effect(() => {
    if (boards.length === 0) {
      selectedBoard = null;
    }
  });
</script>

<div class="flex flex-col items-stretch justify-start gap-2">
  <div class="flex flex-row gap-4">
    <span class="h3 font-bold">Select Channel</span>
  
    <ToggleGroup.Root type="single" bind:value={selectedChannel} {disabled}>
      {#each Object.keys(channels) as key}
        <ToggleGroup.Item value={key} {disabled}>
          {key.charAt(0).toUpperCase() + key.slice(1)}
        </ToggleGroup.Item>
      {/each}
    </ToggleGroup.Root>
  </div>

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
  <span class="h3 font-bold mr-4">Select Board</span>
  <Popover>
    <PopoverTrigger>
      <Button
        variant="outline"
        role="combobox"
        class="w-[240px] justify-between"
      >
        {selectedBoard ?? 'Select a board...'}
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[240px] p-0">
      <Command>
        <CommandInput placeholder="Search boards..." />
        <CommandEmpty>No board found.</CommandEmpty>
        <CommandGroup>
          {#each boards as board}
            <CommandItem
              value={board}
              onSelect={() => {
                selectedBoard = board;
              }}
            >
              <Check
                class={cn(
                  "mr-2 h-4 w-4",
                  selectedBoard !== board && "text-transparent"
                )}
              />
              {board}
            </CommandItem>
          {/each}
        </CommandGroup>
      </Command>
    </PopoverContent>
  </Popover>
</label>
