<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { ParaglideMessage } from '@inlang/paraglide-js-svelte';
  import { shockerShockerShareRemove } from '#lib/api/index.js';
  import type { UserShareInfo } from '#lib/api/index.js';
  import { Copy, Trash } from '@lucide/svelte';
  import * as Avatar from '@openshock/svelte-core/components/ui/avatar';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Drawer from '@openshock/svelte-core/components/ui/drawer';
  import * as Table from '@openshock/svelte-core/components/ui/table';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { copyToClipboard } from '@openshock/svelte-core/utils';
  import { dialog } from '@openshock/svelte-core/components/dialog-manager';
  import { userSharesState, refreshUserShares } from '#lib/state/user-shares-state.svelte.js';
  import { userState } from '#lib/state/user-state.svelte.js';
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
        m.incoming_share_toast_removed_shocker({ shocker: shocker.name, name: userShare.name })
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
      title: m.incoming_share_remove_shocker_title(),
      descSnippet: deleteConfirmDesc,
      data: shocker,
      confirmButtonText: m.share_remove(),
    });
    if (result.confirmed) await deleteShockerShare(result.data);
  }
</script>

{#snippet deleteConfirmDesc(shocker: UserShareInfo)}
  <p>
    <ParaglideMessage
      message={m.incoming_share_remove_shocker_desc}
      inputs={{ shocker: shocker.name, name: userShare.name }}
    >
      {#snippet strong({ children })}<strong>{@render children?.()}</strong>{/snippet}
    </ParaglideMessage>
  </p>
{/snippet}

<Drawer.Root bind:open={editDrawer} direction="right">
  <Drawer.Content>
    <div class="mx-auto flex max-h-dvh w-full flex-col">
      <Drawer.Header class="shrink-0">
        <Drawer.Description>{m.incoming_share_manage_from()}</Drawer.Description>
        <Drawer.Title class="mt-1 flex items-center gap-2">
          <Avatar.Root class="size-10">
            <Avatar.Image src={userShare.image} alt={m.common_user_avatar()} />
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
                      title={m.common_copy_id()}
                      onclick={() => copyToClipboard(shocker.id, m.common_id_copied())}
                    >
                      <Copy />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      title={m.share_remove()}
                      aria-label={m.share_remove()}
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
