<script lang="ts">
  import { Trash } from '@lucide/svelte';
  import { shockersV1Api } from '$lib/api';
  import { ComparePermissionsAndLimits } from '$lib/comparers/UserShareComparer';
  import LoadingCircle from '$lib/components/svg/LoadingCircle.svelte';
  import * as Avatar from '$lib/components/ui/avatar';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import * as Drawer from '$lib/components/ui/drawer';
  import * as Tabs from '$lib/components/ui/tabs';
  import MultiPauseToggle from '$lib/components/utils/MultiPauseToggle.svelte';
  import PauseToggle from '$lib/components/utils/PauseToggle.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { openConfirmDialog } from '$lib/stores/ConfirmDialogStore';
  import { UserShares, refreshUserShares } from '$lib/stores/UserSharesStore';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { derived } from 'svelte/store';
  import RestrictionsSelector from '../restrictions-selector.svelte';

  interface Props {
    storeIndex: number;
    editDrawer: boolean;
  }

  let saving = $state(false);

  let { storeIndex, editDrawer = $bindable() }: Props = $props();

  let userShare = derived(UserShares, ($a) => $a.outgoing[storeIndex]);
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
    createdOn: Date;
    paused: boolean;
  }

  let shares = $state<EditableShare[]>([]);

  let uniformLimits = $state({
    intensity: 1,
    duration: 300,
  });

  onMount(() => {
    shares = $userShare.shares.map((share) => ({
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

    isUniformRestrictions = $userShare.shares.every((share) =>
      ComparePermissionsAndLimits(share, $userShare.shares[0])
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
      // Update the shares once more before saving to make sure we apply the uniform restrictions to all shockers
      // This can happen when the user doesnt change any value but switched to uniform mode.
      shares.forEach((share) => {
        share.permissions = uniformPermissions;
        share.limits = uniformLimits;
      });
    }

    let promises: Promise<void>[] = [];

    shares.forEach((share) => {
      promises.push(
        shockersV1Api
          .shockerShockerShareCodeUpdate(share.id, $userShare.id, {
            limits: {
              intensity: share.limits.intensity === 100 ? null : share.limits.intensity,
              duration: share.limits.duration === 30_000 ? null : share.limits.duration,
            },
            permissions: share.permissions,
          })
          .then(() => {
            // Update the list copy of the share
            const index = $userShare.shares.findIndex((s) => s.id === share.id);
            if (index !== -1) {
              UserShares.update((u) => {
                const item = u.outgoing[storeIndex].shares[index];

                u.outgoing[storeIndex].shares[index] = {
                  ...item,
                  ...share,
                  paused: share.paused ? item.paused | 2 : item.paused & ~2,
                };
                return u;
              });
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
      await shockersV1Api.shockerShockerShareRemove(shocker.id, $userShare.id);
      toast.success(`Successfully removed shocker share ${shocker.name}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      refreshUserShares();
    }
  }

  function handleDeleteClick(shocker: EditableShare) {
    openConfirmDialog({
      title: 'Confirm Deletion',
      descSnippet: deleteConfirmDesc,
      data: shocker,
      onConfirm: deleteShockerShare,
      confirmButtonText: 'Remove',
    });
  }

  function onTabChanged(value: string) {
    isUniformRestrictions = value === 'uniform';
  }

  $effect(() => {
    // Nice instant state update to indicate what is happening to the share limits
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
    <strong>{$userShare.name}</strong>?
  </p>
{/snippet}

<Drawer.Root bind:open={editDrawer} direction="right">
  <Drawer.Content>
    <div class="mx-auto w-full max-h-[100vh] flex flex-col">
      <Drawer.Header class="shrink-0">
        <Drawer.Description>Edit shares for</Drawer.Description>
        <Drawer.Title class="flex items-center gap-2 mt-1">
          <Avatar.Root class="size-10">
            <Avatar.Image src={$userShare.image} alt="User Avatar" />
            <Avatar.Fallback>
              {$userShare.name.charAt(0)}
            </Avatar.Fallback>
          </Avatar.Root>
          <b>{$userShare.name}</b></Drawer.Title
        >
      </Drawer.Header>
      <div class="p-4 pb-0 mb-5 min-h-0">
        <Tabs.Root
          value={isUniformRestrictions ? 'uniform' : 'individual'}
          onValueChange={onTabChanged}
          class="flex flex-col h-full"
        >
          <div>
            <div class="flex items-center justify-between shrink-0">
              <p class="text-lg font-bold grow self-end border-b border-b-neutral-800 mr-[-15px]">
                Limits and Permissions
              </p>

              <Tabs.List>
                <Tabs.Trigger value="uniform">User</Tabs.Trigger>
                <Tabs.Trigger value="individual">Shockers</Tabs.Trigger>
              </Tabs.List>
            </div>
            <p class="mb-6 text-neutral-400 text-[10pt] text-right">
              {isUniformRestrictions
                ? 'Apply same restrictions to all shockers'
                : 'Change restrictions for individual shockers'}
            </p>
          </div>

          <div class="overflow-y-auto">
            <Tabs.Content value="uniform">
              <div class="flex flex-col gap-2 border-1 border-neutral-800 p-4 rounded-md h-75">
                <span class="flex">
                  <span class="ml-auto">
                    <MultiPauseToggle
                      shockers={shares.map((share) => ({
                        shockerId: share.id,
                        paused: share.paused,
                        userShareUserId: $userShare.id,
                      }))}
                      onPausedChange={(paused) => {
                        shares.forEach((share) => (share.paused = paused)); // Update the local copy of the shares

                        // Update the actual store shares
                        UserShares.update((current) => {
                          current.outgoing[storeIndex].shares.forEach(
                            (share) =>
                              (share.paused = paused ? share.paused | 2 : share.paused & ~2)
                          );
                          return current;
                        });
                      }}
                    />
                  </span>
                </span>

                <RestrictionsSelector
                  bind:permissions={uniformPermissions}
                  bind:limits={uniformLimits}
                />
              </div>
            </Tabs.Content>
            <Tabs.Content value="individual">
              <div class="flex flex-col gap-8">
                {#each shares as share, i (share.id)}
                  <div class="flex flex-col gap-2 border-1 border-neutral-800 p-4 rounded-md">
                    <div class="flex justify-between">
                      <span>
                        <Badge>{shares[i].name}</Badge>
                      </span>
                      <span>
                        <PauseToggle
                          shockerId={shares[i].id}
                          bind:paused={shares[i].paused}
                          userShareUserId={$userShare.id}
                          onPausedChange={(paused) => {
                            UserShares.update((current) => {
                              current.outgoing[storeIndex].shares.forEach((s) => {
                                if (s.id === share.id) {
                                  s.paused = paused ? s.paused | 2 : s.paused & ~2; // Update the store shares list
                                }
                              });
                              return current;
                            });
                          }}
                        />
                        <Button
                          variant="destructive"
                          onclick={() => handleDeleteClick(shares[i])}
                          class="ml-4"
                        >
                          <Trash />
                        </Button>
                      </span>
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
      </div>

      <Drawer.Footer class="flex flex-row justify-between mx-20 shrink-0">
        <Drawer.Close>Cancel</Drawer.Close>
        <Button onclick={handleSave}
          >Save {#if saving}<LoadingCircle />{/if}</Button
        >
      </Drawer.Footer>
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
