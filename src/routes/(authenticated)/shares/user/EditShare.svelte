<script lang="ts">
  import { Volume2, Waves, Zap } from '@lucide/svelte';
  import { shockersV1Api } from '$lib/api';
  import type { V2UserSharesListItem } from '$lib/api/internal/v2';
  import { ComparePermissionsAndLimits } from '$lib/comparers/UserShareComparer';
  import LoadingCircle from '$lib/components/svg/LoadingCircle.svelte';
  import * as Avatar from '$lib/components/ui/avatar';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import * as Drawer from '$lib/components/ui/drawer';
  import Label from '$lib/components/ui/label/label.svelte';
  import Slider from '$lib/components/ui/slider/slider.svelte';
  import * as Tabs from '$lib/components/ui/tabs';
  import MultiPauseToggle from '$lib/components/utils/MultiPauseToggle.svelte';
  import PauseToggle from '$lib/components/utils/PauseToggle.svelte';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import PermissionSwitch from './PermissionSwitch.svelte';

  interface Props {
    userShare: V2UserSharesListItem;
    onUpdated: () => void;
    editDrawer: boolean;
  }

  let saving = $state(false);

  let { userShare = $bindable(), onUpdated, editDrawer = $bindable() }: Props = $props();

  let isUniformRestrictions = $state(false);

  let uniformPermissions = $state({
    live: false,
    shock: false,
    vibrate: false,
    sound: false,
  });

  let uniformLimits = $state({
    intensity: 1,
    duration: 300,
  });

  let shares = $state(
    userShare.shares.map((share) => ({
      ...share,
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
    }))
  );

  onMount(() => {
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
          .shockerShockerShareCodeUpdate(share.id, userShare.id, {
            limits: {
              intensity: share.limits.intensity === 100 ? null : share.limits.intensity,
              duration: share.limits.duration === 30_000 ? null : share.limits.duration,
            },
            permissions: share.permissions,
          })
          .then(() => {
            // Update the list copy of the share
            const index = userShare.shares.findIndex((s) => s.id === share.id);
            if (index !== -1) {
              userShare.shares[index] = { ...userShare.shares[index], ...share };
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

  function onTabChanged(value: string) {
    isUniformRestrictions = value === 'uniform';
  }

  $effect(() => {
    // Nice instant state update to indicate what is happening to the share limits
      shares.forEach((share) => {
        share.permissions = { ...uniformPermissions };
        share.limits = { ...uniformLimits };
      });
  });

</script>

<Drawer.Root
  bind:open={editDrawer}
  onOpenChange={(newState) => (editDrawer = newState)}
  direction="right"
>
  <Drawer.Content>
    <div class="mx-auto w-full">
      <Drawer.Header>
        <Drawer.Description>Edit shares for</Drawer.Description>
        <Drawer.Title class="flex items-center gap-2 mt-1">
          <Avatar.Root class="size-10">
            <Avatar.Image src={userShare.image} alt="User Avatar" />
            <Avatar.Fallback>
              {userShare.name.charAt(0)}
            </Avatar.Fallback>
          </Avatar.Root>
          <b>{userShare.name}</b></Drawer.Title
        >
      </Drawer.Header>
      <div class="p-4 pb-0 mb-5">
        <Tabs.Root
          value={isUniformRestrictions ? 'uniform' : 'individual'}
          onValueChange={onTabChanged}
        >
          {isUniformRestrictions}
          <div class="flex items-center justify-between">
            <p class="text-lg font-bold grow self-end border-b border-b-neutral-800 mr-[-15px]">
              Limits and Permissions
            </p>

            <Tabs.List>
              <Tabs.Trigger value="uniform">User</Tabs.Trigger>
              <Tabs.Trigger value="individual">Shockers</Tabs.Trigger>
            </Tabs.List>
          </div>

          <Tabs.Content value="uniform">
            <p class="mb-6 text-neutral-400 text-[10pt] mt-[-10px] text-right">
              Apply same restrictions to all shockers
            </p>
            <!-- Intensity Slider -->
            <div class="flex flex-col gap-2 border-1 border-neutral-800 p-4 rounded-md h-75">
              <span class="flex">
                <span class="ml-auto">
                  <MultiPauseToggle
                    shockers={shares.map((share) => ({
                      shockerId: share.id,
                      paused: share.paused,
                      userShareUserId: userShare.id,
                    }))}
                    onPausedChange={(paused) => {
                      shares.forEach((share) => (share.paused = paused)); // Update the local copy of the shares
                      userShare.shares.forEach((share) => (share.paused = paused)); // Update the actual lists shares
                    }}
                  />
                </span>
              </span>
              <div>
                <Label class="mb-3 text-sm">Intensity: {uniformLimits.intensity}%</Label>
                <Slider
                  type="single"
                  bind:value={uniformLimits.intensity}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              <div>
                <Label class="mb-3 text-sm">Duration: {uniformLimits.duration / 1000}s</Label>
                <Slider
                  type="single"
                  bind:value={uniformLimits.duration}
                  min={0}
                  max={30_000}
                  step={100}
                />
              </div>

              <br />

              <div class="flex gap-3">
                <PermissionSwitch icon={Zap} bind:enabled={uniformPermissions.shock} />
                <PermissionSwitch icon={Waves} bind:enabled={uniformPermissions.vibrate} />
                <PermissionSwitch icon={Volume2} bind:enabled={uniformPermissions.sound} />
                <PermissionSwitch icon={Volume2} bind:enabled={uniformPermissions.live} />
              </div>
            </div>
          </Tabs.Content>
          <Tabs.Content value="individual">
            <p class="mb-6 text-neutral-400 text-[10pt] mt-[-10px] text-right">
              Change restrictions for individual shockers
            </p>
            <div class="flex flex-col gap-8 overflow-x-auto">
              {#each shares as share, i (share.id)}
                <div class="flex flex-col gap-2 border-1 border-neutral-800 p-4 rounded-md">
                  <div class="flex justify-between">
                    <span>
                      <Badge>{shares[i].name}</Badge>
                    </span>
                    <PauseToggle
                      shockerId={shares[i].id}
                      bind:paused={shares[i].paused}
                      userShareUserId={userShare.id}
                      onPausedChange={(paused) => {
                        userShare.shares.forEach((s) => {
                          if (s.id === share.id) {
                            s.paused = paused; // Update the actual shares list
                          }
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label class="mb-3 text-sm">Intensity: {shares[i].limits.intensity}%</Label>
                    <Slider
                      type="single"
                      bind:value={shares[i].limits.intensity}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div>
                    <Label class="mb-3 text-sm">Duration: {shares[i].limits.duration / 1000}s</Label>
                    <Slider
                      type="single"
                      bind:value={shares[i].limits.duration}
                      min={0}
                      max={30_000}
                      step={100}
                    />
                  </div>

                  <br />

                  <div class="flex gap-3">
                    <PermissionSwitch icon={Zap} bind:enabled={shares[i].permissions.shock} />
                    <PermissionSwitch icon={Waves} bind:enabled={shares[i].permissions.vibrate} />
                    <PermissionSwitch icon={Volume2} bind:enabled={shares[i].permissions.sound} />
                    <PermissionSwitch icon={Volume2} bind:enabled={shares[i].permissions.live} />
                  </div>
                </div>
              {/each}
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>

      <Drawer.Footer class="flex flex-row justify-between mx-20">
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
