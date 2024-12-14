<script lang="ts">
  import { GetChannelBoards } from '$lib/api/firmwareCDN';
  import { Popover, PopoverTrigger, PopoverContent } from '$lib/components/ui/popover';
  import { Button } from '$lib/components/ui/button';
  import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '$lib/components/ui/command';
  import { cn } from '$lib/utils';
  
  import { Check, ChevronsUpDown } from 'lucide-svelte';

  /** Optional chip to constrain the list of boards to */
  //export let chip: string | null = null;
  interface Props {
    version: string | null;
    selectedBoard?: string | null;
    disabled?: boolean;
  }

  let { version, selectedBoard = $bindable(null), disabled = false }: Props = $props();

  let boardsCache = $state<{ [key: string]: string[] }>({});
  $effect(() => {
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

<div class="flex flex-row items-center justify-start gap-2">
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
              onSelect={() => (selectedBoard = board)}
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
</div>
