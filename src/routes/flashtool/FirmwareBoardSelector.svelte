<script lang="ts">
  import { Check, ChevronsUpDown } from '@lucide/svelte';
  import { ExtractBoards, type FirmwareLatestResponse } from '$lib/api/firmwareRepo';
  import { Button } from '$lib/components/ui/button';
  import * as Command from '$lib/components/ui/command';
  import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
  import { cn } from '$lib/utils';

  interface Props {
    latestResponse: FirmwareLatestResponse | null;
    selectedBoard?: string | null;
    disabled?: boolean;
  }

  let { latestResponse, selectedBoard = $bindable(null), disabled = false }: Props = $props();

  let boards = $derived(latestResponse ? ExtractBoards(latestResponse) : []);
  $effect(() => {
    if (boards.length === 0) {
      selectedBoard = null;
    }
  });
</script>

<div class="flex flex-row items-center justify-start gap-2">
  <Popover>
    <PopoverTrigger>
      <Button variant="outline" role="combobox" class="w-[240px] justify-between" {disabled}>
        {selectedBoard ?? 'Select a board...'}
        <ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[240px] p-0">
      <Command.Root>
        <Command.Input placeholder="Search boards..." />
        <Command.Empty>No board found.</Command.Empty>
        <Command.Group>
          {#each boards as board (board)}
            <Command.Item value={board} onSelect={() => (selectedBoard = board)}>
              <Check class={cn('mr-2 size-4', selectedBoard !== board && 'text-transparent')} />
              {board}
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.Root>
    </PopoverContent>
  </Popover>
</div>
