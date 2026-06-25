<script lang="ts">
  import { shockerShockerShareRemove } from '$lib/api';
  import type { UserShareInfo } from '$lib/api';
  import { Copy, Trash } from '@lucide/svelte';
  import * as Avatar from '$hadcn/avatar';
  import Button from '$hadcn/button/button.svelte';
  import * as Drawer from '$hadcn/drawer';
  import * as Table from '$hadcn/table';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { copyToClipboard } from '$core/utils/clipboard.svelte';
  import { dialog } from '$core/components/dialog-manager/dialog-store.svelte';
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
      await shockerShockerShareRemove({
        path: { shockerId: shocker.id, sharedWithUserId: userState.self!.id },
      });
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
                  <div class="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Copy ID"
                      onclick={() => copyToClipboard(shocker.id, 'ID copied to clipboard')}
                    >
                      <Copy />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      title="Remove share"
                      aria-label="Remove share"
                      onclick={() => handleDeleteClick(shocker)}
                    >
                      <Trash />
                    </Button>
                  </div>
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
