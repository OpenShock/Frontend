<script lang="ts">
  import { Trash } from '@lucide/svelte';
  import { shockersV1Api } from '$lib/api';
  import type { UserShareInfo } from '$lib/api/internal/v2';
  import * as Avatar from '$lib/components/ui/avatar';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Drawer from '$lib/components/ui/drawer';
  import * as Table from '$lib/components/ui/table/index.js';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { dialog } from '$lib/components/dialog-manager/dialog-store.svelte';
  import { userSharesState, refreshUserShares } from '$lib/state/user-shares-state.svelte';
  import { userState } from '$lib/state/user-state.svelte';
  import { toast } from 'svelte-sonner';

  interface Props {
    storeIndex: number;
    editDrawer: boolean;
  }

  let { storeIndex, editDrawer = $bindable() }: Props = $props();

  let userShare = $derived(userSharesState.shares.incoming[storeIndex]);

  async function deleteShockerShare(shocker: UserShareInfo) {
    try {
      await shockersV1Api.shockerShockerShareRemove(shocker.id, userState.self!.id);
      toast.success(
        `Successfully removed incoming Shocker Share ${shocker.name} by ${userShare.name}`
      );
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      refreshUserShares();
    }
  }

  async function handleDeleteClick(shocker: UserShareInfo) {
    const result = await dialog.confirm({
      title: 'Confirm removal of Incoming Shocker Share',
      descSnippet: deleteConfirmDesc,
      data: shocker,
      confirmButtonText: 'Remove Share',
    });
    if (result.confirmed) await deleteShockerShare(result.data);
  }
</script>

{#snippet deleteConfirmDesc(shocker: UserShareInfo)}
  <p>
    Are you sure you want to remove the shocker share <strong>{shocker.name}</strong> by
    <strong>{userShare.name}</strong>?
  </p>
{/snippet}

<Drawer.Root bind:open={editDrawer} direction="right">
  <Drawer.Content>
    <div class="mx-auto flex max-h-[100vh] w-full flex-col">
      <Drawer.Header class="shrink-0">
        <Drawer.Description>Manage Shares from</Drawer.Description>
        <Drawer.Title class="mt-1 flex items-center gap-2">
          <Avatar.Root class="size-10">
            <Avatar.Image src={userShare.image} alt="User Avatar" />
            <Avatar.Fallback>
              {userShare.name.charAt(0)}
            </Avatar.Fallback>
          </Avatar.Root>
          <b>{userShare.name}</b></Drawer.Title
        >
      </Drawer.Header>
      <div class="m-4 overflow-y-auto rounded-md border">
        <Table.Root>
          <Table.Body>
            {#each userShare.shares as shocker (shocker.id)}
              <Table.Row>
                <Table.Cell>
                  {shocker.name}
                </Table.Cell>
                <Table.Cell class="w-0">
                  <Button variant="destructive" onclick={() => handleDeleteClick(shocker)}>
                    <Trash />
                  </Button>
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  </Drawer.Content>
</Drawer.Root>

<style>
  :global(.data-\[vaul-drawer-direction\=right\]\:sm\:max-w-sm) {
    &[data-vaul-drawer-direction='right'] {
      @media (width >= 40rem) {
        max-width: 33rem;
      }
    }
  }
</style>
