<script lang="ts">
  import { Ellipsis } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

  interface Props {
    shocker: ShockerResponse;
  }

  let { shocker }: Props = $props();

  function viewLogs() {
    goto(`/shockers/logs/${shocker.id}`);
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
        <span class="sr-only">Open menu</span>
        <Ellipsis class="size-4" />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item class="cursor-pointer" onclick={viewLogs}>View Logs</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
