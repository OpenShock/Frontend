<script lang="ts">
  import { shockerSharesV2Api } from '$lib/api';
  import type { V2UserShares, V2UserSharesListItem } from '$lib/api/internal/v2';
  import * as Table from '$lib/components/ui/table';
  import { onMount } from 'svelte';
  import UserShareItem from './UserShareItem.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Plus, RectangleEllipsis, User } from '@lucide/svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import DialogShareCodeCreate from './dialog-share-code-create.svelte';
  import { OwnHubsStore, refreshOwnHubs } from '$lib/stores/HubsStore';
  import EditShare from './edit-share.svelte';

  let createDialogOpen = $state(false);
  let userShares = $state<V2UserShares>({ outgoing: [], incoming: [] });
  let editShareDrawerOpen = $state(false);
  let editShareDrawerOpenCount = $state(0);
  let editIndex = $state(0);

  function refreshUserShares() {
    shockerSharesV2Api
      .sharesGetSharesByUsers()
      .then((response) => {
        userShares = response;
      })
      .catch((error) => {
        console.error(error); // TODO: Show toast
      });
  }

  onMount(() => {
    refreshUserShares()
    refreshOwnHubs()
  });

  function openEditDrawer(userShareIndex: number) {
    editIndex = userShareIndex;
    editShareDrawerOpenCount += 1;
    editShareDrawerOpen = true;
  }
</script>

<DialogShareCodeCreate bind:open={createDialogOpen} onCreated={refreshUserShares} />

{#key editShareDrawerOpenCount}
  {#if userShares.outgoing[editIndex] !== undefined}
    <EditShare bind:userShare={userShares.outgoing[editIndex]} bind:editDrawer={editShareDrawerOpen} />
  {/if}
{/key}

<div class="h-full m-8 mt-4 flex flex-col gap-4">
  <div class="flex-none flex justify-end">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            {#snippet child({ props })}
              <Button {...props}>
                <Plus />
                New Share
              </Button>
            {/snippet}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Group>
              <DropdownMenu.Item><User /> To User</DropdownMenu.Item>
              <DropdownMenu.Item onclick={() => createDialogOpen = true}><RectangleEllipsis /> Create Code</DropdownMenu.Item>
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
  </div>
  <div class="rounded-md border overflow-y-auto">
    <Table.Root>
      <Table.Body>
        {#each userShares.outgoing as userShare, i (userShare.id)}
          <UserShareItem bind:userShare={userShares.outgoing[i]} onOpenEdit={() => openEditDrawer(i)} />
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>
