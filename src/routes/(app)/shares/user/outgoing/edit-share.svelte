<script lang="ts">
  import { shockerShockerShareCodeUpdate, shockerShockerShareRemove } from '$lib/api';
  import { Trash2 } from '@lucide/svelte';
  import { ComparePermissionsAndLimits } from '$lib/comparers/UserShareComparer';
  import RestrictionsSelector from '$lib/components/shares/restrictions-selector.svelte';
  import LoadingCircle from '$lib/components/svg/LoadingCircle.svelte';
  import * as Avatar from '$lib/components/ui/avatar';
  import { Button } from '$lib/components/ui/button';
  import * as Drawer from '$lib/components/ui/drawer';
  import * as Tabs from '$lib/components/ui/tabs';
  import MultiPauseToggle from '$lib/components/utils/MultiPauseToggle.svelte';
  import PauseToggle from '$lib/components/utils/PauseToggle.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { dialog } from '$lib/components/dialog-manager/dialog-store.svelte';
  import { userSharesState, refreshUserShares } from '$lib/state/user-shares-state.svelte';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';

  interface Props {
    storeIndex: number;
    editDrawer: boolean;
  }

  let saving = $state(false);

  let { storeIndex, editDrawer = $bindable() }: Props = $props();

  let userShare = $derived(userSharesState.shares.outgoing[storeIndex]);
  let isUniformRestrictions = $state(false);

  let uniformPermissions = $state({
    live: false,
    shock: false,
    vibrate: false,
    sound: false,
  });

  interface EditableShare {
    limits: {
      intensity: number;
      duration: number;
    };
    permissions: {
      live: boolean;
      shock: boolean;
      vibrate: boolean;
      sound: boolean;
    };
    id: string;
    name: string;
    createdOn: Temporal.Instant;
    paused: boolean;
  }

  let shares = $state<EditableShare[]>([]);

  let uniformLimits = $state({
    intensity: 1,
    duration: 300,
  });

  onMount(() => {
    shares = userShare.shares.map((share) => ({
      ...share,
      paused: share.paused !== 0,
      limits: {
        intensity: share.limits.intensity ?? 100,
        duration: share.limits.duration ?? 30_000,
      },
      permissions: {
        live: share.permissions.live ?? false,
        shock: share.permissions.shock ?? false,
        vibrate: share.permissions.vibrate ?? false,
        sound: share.permissions.sound ?? false,
      },
    }));

    if (shares.length === 0) {
      console.error('User share has no shares to edit.');
      return;
    }

    isUniformRestrictions = userShare.shares.every((share) =>
      ComparePermissionsAndLimits(share, userShare.shares[0])
    );

    const limit = shares[0].limits;
    uniformLimits = {
      intensity: limit.intensity === null ? 100 : limit.intensity,
      duration: limit.duration === null ? 30_000 : limit.duration,
    };

    const permission = shares[0].permissions;
    uniformPermissions = {
      live: permission.live ?? false,
      shock: permission.shock ?? false,
      vibrate: permission.vibrate ?? false,
      sound: permission.sound ?? false,
    };
  });

  function handleSave() {
    if (saving) return;
    saving = true;

    if (isUniformRestrictions) {
      shares.forEach((share) => {
        share.permissions = uniformPermissions;
        share.limits = uniformLimits;
      });
    }

    let promises: Promise<void>[] = [];

    shares.forEach((share) => {
      promises.push(
        shockerShockerShareCodeUpdate({
          path: { shockerId: share.id, sharedWithUserId: userShare.id },
          body: {
            limits: {
              intensity: share.limits.intensity === 100 ? null : share.limits.intensity,
              duration: share.limits.duration === 30_000 ? null : share.limits.duration,
            },
            permissions: share.permissions,
          },
        })
          .then(() => {
            const index = userShare.shares.findIndex((s) => s.id === share.id);
            if (index !== -1) {
              const item = userSharesState.shares.outgoing[storeIndex].shares[index];
              userSharesState.shares.outgoing[storeIndex].shares[index] = {
                ...item,
                ...share,
                paused: share.paused ? item.paused | 2 : item.paused & ~2,
              };
            }
          })
          .catch((error) => {
            toast.error(`Failed to update share ${share.id}: ${error.message}`);
          })
      );
    });

    Promise.all(promises).finally(() => {
      editDrawer = false;
      saving = false;
    });
  }

  async function deleteShockerShare(shocker: EditableShare) {
    try {
      await shockerShockerShareRemove({
        path: { shockerId: shocker.id, sharedWithUserId: userShare.id },
      });
      toast.success(`Successfully removed shocker share ${shocker.name}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      refreshUserShares();
    }
  }

  async function handleDeleteClick(shocker: EditableShare) {
    const result = await dialog.confirm({
      title: 'Confirm Deletion',
      descSnippet: deleteConfirmDesc,
      data: shocker,
      confirmButtonText: 'Remove',
    });
    if (result.confirmed) await deleteShockerShare(result.data);
  }

  function onTabChanged(value: string) {
    isUniformRestrictions = value === 'uniform';
  }

  $effect(() => {
    if (editDrawer && isUniformRestrictions) {
      shares.forEach((share) => {
        share.permissions = { ...uniformPermissions };
        share.limits = { ...uniformLimits };
      });
    }
  });
</script>

{#snippet deleteConfirmDesc(shocker: EditableShare)}
  <p>
    Are you sure you want to remove the shocker share <strong>{shocker.name}</strong> for
    <strong>{userShare.name}</strong>?
  </p>
{/snippet}

<Drawer.Root bind:open={editDrawer} direction="right">
  <Drawer.Content>
    <div class="mx-auto flex h-full max-h-[100vh] w-full flex-col">
      <Drawer.Header class="shrink-0 border-b">
        <Drawer.Description class="text-muted-foreground text-xs">
          Editing shares for
        </Drawer.Description>
        <Drawer.Title class="flex items-center gap-3">
          <Avatar.Root class="size-10">
            <Avatar.Image src={userShare.image} alt="User Avatar" />
            <Avatar.Fallback>
              {userShare.name.charAt(0)}
            </Avatar.Fallback>
          </Avatar.Root>
          <span class="text-lg">{userShare.name}</span>
        </Drawer.Title>
      </Drawer.Header>

      <Tabs.Root
        value={isUniformRestrictions ? 'uniform' : 'individual'}
        onValueChange={onTabChanged}
        class="flex min-h-0 flex-1 flex-col"
      >
        <div class="flex shrink-0 items-center justify-between gap-3 px-4 pt-4 pb-3">
          <div class="flex min-w-0 flex-col">
            <h3 class="text-sm font-semibold">Limits &amp; Permissions</h3>
            <p class="text-muted-foreground text-xs">
              {isUniformRestrictions
                ? 'Same restrictions on every shocker'
                : 'Tune restrictions per shocker'}
            </p>
          </div>
          <Tabs.List>
            <Tabs.Trigger value="uniform">All</Tabs.Trigger>
            <Tabs.Trigger value="individual">Per shocker</Tabs.Trigger>
          </Tabs.List>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <Tabs.Content value="uniform" class="mt-0">
            <div class="border-border/60 bg-card flex flex-col gap-4 rounded-md border p-4">
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground text-xs">
                  Applies to {shares.length} shocker{shares.length === 1 ? '' : 's'}
                </span>
                <MultiPauseToggle
                  shockers={shares.map((share) => ({
                    shockerId: share.id,
                    paused: share.paused,
                    userShareUserId: userShare.id,
                  }))}
                  onPausedChange={(paused) => {
                    shares.forEach((share) => (share.paused = paused));
                    userSharesState.shares.outgoing[storeIndex].shares.forEach(
                      (share) => (share.paused = paused ? share.paused | 2 : share.paused & ~2)
                    );
                  }}
                />
              </div>

              <RestrictionsSelector
                bind:permissions={uniformPermissions}
                bind:limits={uniformLimits}
              />
            </div>
          </Tabs.Content>

          <Tabs.Content value="individual" class="mt-0">
            <div class="flex flex-col gap-3">
              {#each shares as share, i (share.id)}
                <div class="border-border/60 bg-card flex flex-col gap-4 rounded-md border p-4">
                  <div class="flex items-center justify-between gap-2">
                    <span class="truncate text-sm font-semibold" title={shares[i].name}>
                      {shares[i].name}
                    </span>
                    <div class="flex shrink-0 items-center gap-1">
                      <PauseToggle
                        shockerId={shares[i].id}
                        bind:paused={shares[i].paused}
                        userShareUserId={userShare.id}
                        onPausedChange={(paused) => {
                          userSharesState.shares.outgoing[storeIndex].shares.forEach((s) => {
                            if (s.id === share.id) {
                              s.paused = paused ? s.paused | 2 : s.paused & ~2;
                            }
                          });
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        class="text-destructive hover:text-destructive h-8 w-8"
                        onclick={() => handleDeleteClick(shares[i])}
                        title="Remove share"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  <RestrictionsSelector
                    bind:permissions={shares[i].permissions}
                    bind:limits={shares[i].limits}
                  />
                </div>
              {/each}
            </div>
          </Tabs.Content>
        </div>
      </Tabs.Root>

      <Drawer.Footer class="border-t px-4 py-3">
        <div class="flex w-full items-center justify-between gap-2">
          <Drawer.Close class="text-sm">Cancel</Drawer.Close>
          <Button onclick={handleSave} disabled={saving}>
            {#if saving}<LoadingCircle />{/if}
            Save
          </Button>
        </div>
      </Drawer.Footer>
    </div>
  </Drawer.Content>
</Drawer.Root>

<style>
  :global(.data-\[vaul-drawer-direction\=right\]\:sm\:max-w-sm) {
    &[data-vaul-drawer-direction='right'] {
      @media (width >= 40rem) {
        max-width: 30rem;
      }
    }
  }
</style>
