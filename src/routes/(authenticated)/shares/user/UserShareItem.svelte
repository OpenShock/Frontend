<script lang="ts">
  import type {
    ShockerLimits,
    ShockerPermissions,
    V2UserSharesListItem,
  } from '$lib/api/internal/v2';
  import { ComparePermissionsAndLimits } from '$lib/comparers/UserShareComparer';
  import * as Avatar from '$lib/components/ui/avatar';
  import { Badge } from '$lib/components/ui/badge';
  import * as Drawer from '$lib/components/ui/drawer';
  import Label from '$lib/components/ui/label/label.svelte';
  import Slider from '$lib/components/ui/slider/slider.svelte';
  import * as Table from '$lib/components/ui/table';
  import * as Tabs from '$lib/components/ui/tabs';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import { onMount } from 'svelte';
  import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
  import { Loader, Save, Volume2, Waves, Zap } from '@lucide/svelte';
  import Switch from '$lib/components/ui/switch/switch.svelte';
  import PermissionSwitch from './PermissionSwitch.svelte';
  import { Button } from '$lib/components/ui/button';
  import { shockerSharesV1Api, shockerSharesV2Api, shockersV1Api } from '$lib/api';
  import { toast } from 'svelte-sonner';

  interface Props {
    userShare: V2UserSharesListItem;
  }

  let editDrawer = $state(false);
  let saving = $state(false);

  let { userShare }: Props = $props();

  const unionRestrictions = userShare.shares.every((share) =>
    ComparePermissionsAndLimits(share, userShare.shares[0])
  );

  let uniformPermissions = $state({
    live: false,
    shock: false,
    vibrate: false,
    sound: false,
  });

  let uniformLimits = $state({
    intensity: 100,
    duration: 30_000,
  });

  onMount(() => {
    if (userShare.shares.length === 0) {
      console.error('User share has no shares to edit.');
      return;
    }

    const limit = userShare.shares[0].limits;
    uniformLimits = {
      intensity: limit.intensity === null ? 100 : limit.intensity,
      duration: limit.duration === null ? 30_000 : limit.duration,
    };

    const permission = userShare.shares[0].permissions;
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

    let savePromise;
    if (uniformRestrictions) {
      savePromise = saveUniform();
    } else {
      savePromise = saveIndividual();
    }

    savePromise.finally(() => {
      saving = false;
    });
  }

  async function saveUniform() {
    let promises: Promise<void>[] = [];

    userShare.shares.forEach(share => {
        promises.push(
          shockersV1Api.shockerShockerShareCodeUpdate(share.id, userShare.id, {
            limits: {
              intensity: uniformLimits.intensity === 100 ? null : uniformLimits.intensity,
            duration: uniformLimits.duration === 30_000 ? null : uniformLimits.duration,
          },
          permissions: uniformPermissions
        }).catch((error) => {
          toast.error(`Failed to update share ${share.id}: ${error.message}`);
        }));
    });

    return Promise.all(promises);
  }

  async function saveIndividual() {
    let promises: Promise<void>[] = [];

    userShare.shares.forEach(share => {
        promises.push(
          shockersV1Api.shockerShockerShareCodeUpdate(share.id, userShare.id, {
            limits: {
              intensity: share.intensity === 100 ? null : share.intensity,
              duration: share.duration === 30_000 ? null : share.duration,
            },
            permissions: share.permissions
          }).catch((error) => {
            toast.error(`Failed to update share ${share.id}: ${error.message}`);
        }));
    });

    return Promise.all(promises);
  }

</script>

<style>
    :global(.data-\[vaul-drawer-direction\=right\]\:sm\:max-w-sm) {
    &[data-vaul-drawer-direction="right"] {
      @media (width >= 40rem) {
        max-width: 33rem;
      }
    }
  }
</style>

<Drawer.Root open={editDrawer} onOpenChange={(newState) => (editDrawer = newState)} direction="right">
  <Drawer.Content>
    <div class="mx-auto w-full max-w-lg">
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
        <Tabs.Root value={uniformPermissions ? 'uniform' : 'individual'}>
          <div class="flex items-center justify-between">
            <p class="text-md font-bold grow self-end border-b border-b-neutral-800 mr-[-15px]">
              Limits and Permissions
            </p>

            <Tabs.List>
              <Tabs.Trigger value="uniform">Uniform</Tabs.Trigger>
              <Tabs.Trigger value="individual">Individual</Tabs.Trigger>
            </Tabs.List>
          </div>

          <Tabs.Content value="uniform">
            <!-- Intensity Slider -->
            <div class="flex flex-col gap-2">
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

              <br>

              <div class="flex gap-3">
                <PermissionSwitch icon={Zap} enabled={uniformPermissions.shock} />
                <PermissionSwitch icon={Waves} enabled={uniformPermissions.vibrate} />
                <PermissionSwitch icon={Volume2} enabled={uniformPermissions.sound} />
                <PermissionSwitch icon={Volume2} enabled={uniformPermissions.live} />
              </div>
                
            </div>
          </Tabs.Content>
          <Tabs.Content value="individual"></Tabs.Content>
        </Tabs.Root>
      </div>

      <Drawer.Footer class="flex flex-row justify-between mx-20">
        <Drawer.Close>Cancel</Drawer.Close>
        <Button onClick={handleSave}>Save {saving && <LoadingSpinner />}</Button>
      </Drawer.Footer>
    </div>
  </Drawer.Content>
</Drawer.Root>

<Table.Row onclick={() => (editDrawer = true)}>
  <Table.Cell class="flex items-center font-medium">
    <Avatar.Root class="h-15 w-15">
      <Avatar.Image src={userShare.image} alt="User Avatar" />
      <Avatar.Fallback>
        {userShare.name.charAt(0)}
      </Avatar.Fallback>
    </Avatar.Root>
    <p class="ml-4">{userShare.name}</p>
  </Table.Cell>
  <Table.Cell>
    <Tooltip.Root>
      <Tooltip.Trigger>
        <span class="bg-sidebar flex items-center rounded-2xl px-1.5 py-0.5 ring-1 ring-slate-800">
          <Zap size="15" />
          <p class="ml-2 inline-block sm:hidden">{userShare.shares.length}</p>
          <div class="hidden sm:inline-block">
            {#each userShare.shares as share}
              <Badge class="ml-2">{share.name}</Badge>
            {/each}
          </div>
        </span>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>Shared shockers</p>
      </Tooltip.Content>
    </Tooltip.Root>
  </Table.Cell>
</Table.Row>
