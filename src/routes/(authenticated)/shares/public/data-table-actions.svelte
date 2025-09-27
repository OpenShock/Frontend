<script lang="ts">
  import Ellipsis from '@lucide/svelte/icons/ellipsis';
  import { goto } from '$app/navigation';
  import type { OwnPublicShareResponse } from '$lib/api/internal/v1';
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { toast } from 'svelte-sonner';
  import SharelinkDeleteDialog from './dialog-publicshare-delete.svelte';

  interface Props {
    publicShare: OwnPublicShareResponse;
    onChange: () => void;
  }

  let { publicShare, onChange }: Props = $props();

  let deleteDialogOpen = $state<boolean>(false);

  function copyId() {
    navigator.clipboard.writeText(publicShare.id);
    toast.success('ID copied to clipboard');
  }
</script>

<SharelinkDeleteDialog bind:open={deleteDialogOpen} {publicShare} onDeleted={onChange} />

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
    <DropdownMenu.Item onclick={copyId}>Copy ID</DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => goto(`/shares/public/${publicShare.id}/edit`)}>
      Edit
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => (deleteDialogOpen = true)}>Delete</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
