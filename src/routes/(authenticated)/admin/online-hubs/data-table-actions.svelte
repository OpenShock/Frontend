<script lang="ts">
  import Ellipsis from '@lucide/svelte/icons/ellipsis';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { toast } from 'svelte-sonner';
  import type { OnlineHub } from './columns';
  import { resolve } from '$app/paths';

  interface Props {
    hub: OnlineHub;
  }

  let { hub }: Props = $props();

  function copyId() {
    navigator.clipboard.writeText(hub.id);
    toast.success('ID copied to clipboard');
  }
  function copyUserId() {
    navigator.clipboard.writeText(hub.owner.id);
    toast.success('User ID copied to clipboard');
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
    <DropdownMenu.Item onclick={copyId}>Copy ID</DropdownMenu.Item>
    <DropdownMenu.Item onclick={copyUserId}>Copy User ID</DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => goto(resolve(`/admin/users/${hub.owner.id}`))}>
      View User
    </DropdownMenu.Item>
    <DropdownMenu.Item>Edit</DropdownMenu.Item>
    <DropdownMenu.Item>Delete</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
