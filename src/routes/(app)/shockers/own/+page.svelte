<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { PUBLIC_DISABLE_SHOCKER_MAP } from '$app/env/public';
  import { shockerPauseShocker, shockerRegisterShocker } from '#lib/api/index.js';
  import type { NewShocker } from '#lib/api/index.js';
  import { Layers, LogsIcon, Plus, RotateCcw, Settings, Zap } from '@lucide/svelte';
  import { resolve } from '$app/paths';
  import { Container, EmptyState, PageHeader } from '@openshock/svelte-core/components';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner';
  import ClassicControlModule from '#lib/components/ControlModules/ClassicControlModule.svelte';
  import DialogShockerAdd, {
    defaultAddShockerData,
  } from '#lib/components/ControlModules/dialogs/dialog-shocker-add.svelte';
  import LiveButton from '#lib/components/ControlModules/LiveButton.svelte';
  import LiveControlModule from '#lib/components/ControlModules/LiveControlModule.svelte';
  import MapControlModule from '#lib/components/ControlModules/MapControlModule.svelte';
  import { ModuleType } from '#lib/components/ControlModules/ModuleType.js';
  import RichControlModule from '#lib/components/ControlModules/RichControlModule.svelte';
  import ShockerCard from '#lib/components/ControlModules/ShockerCard.svelte';
  import ShockerMenu from '#lib/components/ControlModules/impl/ShockerMenu.svelte';
  import ShockerPauseButton from '#lib/components/ControlModules/impl/ShockerPauseButton.svelte';
  import SimpleControlHeader from '#lib/components/ControlModules/SimpleControlHeader.svelte';
  import SimpleControlModule from '#lib/components/ControlModules/SimpleControlModule.svelte';
  import { dialog } from '@openshock/svelte-core/components/dialog-manager';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Popover from '@openshock/svelte-core/components/ui/popover';
  import {
    ControlDurationDefault,
    ControlIntensityDefault,
  } from '#lib/constants/ControlConstants.js';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { ControlType } from '#lib/signalr/models/ControlType.js';
  import { getConnection } from '#lib/signalr/user.svelte.js';
  import { serializeControlMessages } from '#lib/signalr/serializers/Control.js';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { ownHubs, onlineHubs, refreshOwnHubs } from '#lib/state/hubs-state.svelte.js';
  import {
    getLiveConnection,
    liveConnections,
    LiveConnectionState,
    registerHubShockers,
  } from '#lib/state/live-control-state.svelte.js';
  import { PersistedState } from '@openshock/svelte-core/state/classes/persisted-state.svelte.js';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';

  registerBreadcrumbs(() => [{ label: m.shockers_title() }]);

  let shockers = $derived(
    ownHubs
      .values()
      .flatMap((hub) => hub.shockers)
      .toArray()
  );
  let flatShockers = $derived(
    Array.from(ownHubs).flatMap(([hubId, hub]) =>
      hub.shockers.map((shocker) => ({ shocker, hubId }))
    )
  );

  // Register each hub's shockers with the live-control state store
  $effect(() => {
    const currentHubIds: string[] = [];
    for (const [hubId, hub] of ownHubs) {
      currentHubIds.push(hubId);
      registerHubShockers(
        hubId,
        hub.shockers.map((s) => ({ id: s.id, isPaused: s.isPaused }))
      );
    }
    for (const [hubId, conn] of liveConnections) {
      if (!currentHubIds.includes(hubId)) {
        conn.disconnect();
        liveConnections.delete(hubId);
      }
    }
  });

  let moduleType = $state<ModuleType>(ModuleType.ClassicControlModule);
  const groupByHub = new PersistedState<boolean>('shockerGroupByHub', false);
  let loading = $state(true);
  let refreshing = $state(false);

  let shockIntensity = $state(ControlIntensityDefault);
  let vibrationIntensity = $state(ControlIntensityDefault);
  let duration = $state(ControlDurationDefault);

  async function loadShockers() {
    loading = true;
    await refreshOwnHubs();
    loading = false;
  }

  async function refresh() {
    refreshing = true;
    await refreshOwnHubs();
    refreshing = false;
    toast.success(m.shockers_toast_refreshed());
  }

  async function openAddShockerDialog() {
    const hubs = ownHubs.entries().toArray();
    if (hubs.length === 0) {
      toast.error(m.shockers_toast_need_hub());
      return;
    }
    const result = await dialog.createDialog<NewShocker | undefined>((resolve) => ({
      content: DialogShockerAdd,
      props: {
        data: { ...defaultAddShockerData(), device: hubs[0]?.[0] ?? '' },
        hubs,
        resolve,
        close: () => resolve(undefined),
      },
      resolve,
    }));
    if (!result) return;
    try {
      await shockerRegisterShocker({ body: result });
      toast.success(m.shockers_toast_added());
      await refreshOwnHubs();
    } catch (error) {
      handleApiError(error);
    }
  }

  onMount(loadShockers);

  function ownCtrl(id: string, type: ControlType, intensity: number, duration: number) {
    const conn = getConnection();
    if (conn) serializeControlMessages(conn, [{ id, type, intensity, duration }]);
  }

  async function ownResume(shockerId: string) {
    try {
      const result = await shockerPauseShocker({ path: { shockerId }, body: { pause: false } });
      // Update the shocker's isPaused state
      for (const hub of ownHubs.values()) {
        const shocker = hub.shockers.find((s) => s.id === shockerId);
        if (shocker) {
          shocker.isPaused = result.data;
          break;
        }
      }
    } catch (error) {
      await handleApiError(error);
    }
  }
</script>

{#snippet shockerCard(
  shocker: import('#lib/api/index.js').ShockerResponse,
  hubId: string,
  showHubBadge: boolean
)}
  {@const liveConn = getLiveConnection(hubId)}
  {@const liveState = liveConn?.getShockerState(shocker.id)}
  {@const isShockerLiveActive =
    (liveState?.isLive ?? false) && liveConn?.state === LiveConnectionState.Connected}
  {@const hub = ownHubs.get(hubId)}
  {@const hubOnline = onlineHubs.get(hubId)?.isOnline ?? false}
  <ShockerCard
    name={shocker.name}
    hubName={hub?.name}
    {hubOnline}
    {showHubBadge}
    isPaused={shocker.isPaused}
    resume={() => ownResume(shocker.id)}
    class="w-full"
  >
    {#snippet live()}
      <LiveButton {hubId} shockerId={shocker.id} compact />
    {/snippet}
    {#snippet pause()}
      <ShockerPauseButton {shocker} />
    {/snippet}
    {#snippet menu()}
      <ShockerMenu {shocker} />
    {/snippet}
    {#if isShockerLiveActive && liveState && liveConn}
      <LiveControlModule shockerId={shocker.id} {liveState} connection={liveConn} />
    {:else if moduleType === ModuleType.ClassicControlModule}
      <ClassicControlModule id={shocker.id} isPaused={shocker.isPaused} ctrl={ownCtrl} />
    {:else if moduleType === ModuleType.RichControlModule}
      <RichControlModule {shocker} />
    {:else if moduleType === ModuleType.SimpleControlModule}
      <SimpleControlModule {shocker} {shockIntensity} {vibrationIntensity} {duration} />
    {:else}
      <p>{m.shockers_unknown_module()}</p>
    {/if}
  </ShockerCard>
{/snippet}

<Container>
  {#if loading}
    <div class="flex items-center gap-3 p-12">
      <Spinner class="size-6" />
      <span class="text-muted-foreground">{m.shockers_loading()}</span>
    </div>
  {:else}
    <PageHeader title={m.shockers_title()} subtitle={m.shockers_subtitle()}>
      <div class="flex flex-wrap items-center gap-1">
        <Button variant="secondary" size="sm" onclick={openAddShockerDialog}>
          <Plus class="size-4" />
          {m.shockers_add()}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onclick={refresh}
          disabled={refreshing}
          aria-label={m.common_refresh()}
        >
          <RotateCcw class={refreshing ? 'size-4 animate-spin' : 'size-4'} />
        </Button>
        <!-- Mode button -->
        <Popover.Root>
          <Popover.Trigger>
            {#snippet child({ props })}
              <Button {...props} variant="ghost" size="sm" aria-label={m.shockers_view_mode()}>
                <Layers class="size-4" />
              </Button>
            {/snippet}
          </Popover.Trigger>
          <Popover.Content class="flex flex-col gap-1" align="end">
            <Button
              variant={moduleType === ModuleType.ClassicControlModule ? 'secondary' : 'ghost'}
              size="sm"
              onclick={() => (moduleType = ModuleType.ClassicControlModule)}
              >{m.shockers_mode_classic()}</Button
            >

            <Button
              variant={moduleType === ModuleType.RichControlModule ? 'secondary' : 'ghost'}
              size="sm"
              onclick={() => (moduleType = ModuleType.RichControlModule)}
              >{m.shockers_mode_rich()}</Button
            >

            <Button
              variant={moduleType === ModuleType.SimpleControlModule ? 'secondary' : 'ghost'}
              size="sm"
              onclick={() => (moduleType = ModuleType.SimpleControlModule)}
              >{m.shockers_mode_simple()}</Button
            >

            {#if !PUBLIC_DISABLE_SHOCKER_MAP}
              <Button
                variant={moduleType === ModuleType.MapControlModule ? 'secondary' : 'ghost'}
                size="sm"
                onclick={() => (moduleType = ModuleType.MapControlModule)}
                >{m.shockers_mode_map()}</Button
              >
            {/if}
          </Popover.Content>
        </Popover.Root>
        <!-- Settings button -->
        <Popover.Root>
          <Popover.Trigger>
            {#snippet child({ props })}
              <Button {...props} variant="ghost" size="sm" aria-label={m.common_settings()}>
                <Settings class="size-4" />
              </Button>
            {/snippet}
          </Popover.Trigger>
          <Popover.Content class="flex flex-col gap-2" align="end">
            <Button
              variant={groupByHub.value ? 'secondary' : 'ghost'}
              size="sm"
              onclick={() => (groupByHub.value = !groupByHub.value)}
              >{m.shockers_group_by_hub()}</Button
            >

            <Button variant="ghost" size="sm" disabled>
              {m.shockers_global_limits()}
              <span class="text-muted-foreground ml-2 text-xs">{m.common_coming_soon()}</span>
            </Button>
          </Popover.Content>
        </Popover.Root>

        <Button
          variant="ghost"
          size="sm"
          aria-label={m.shockers_logs_label()}
          href={resolve('shockers/logs')}><LogsIcon class="size-4" /></Button
        >
      </div>
    </PageHeader>

    {#if shockers.length === 0}
      <EmptyState
        icon={Zap}
        title={m.shockers_empty_title()}
        description={ownHubs.size === 0 ? m.shockers_empty_no_hubs() : m.shockers_empty_has_hubs()}
      >
        {#if ownHubs.size === 0}
          <Button size="lg" href={resolve('hubs')}
            ><Plus class="size-4" />{m.shockers_create_hub()}</Button
          >
        {:else}
          <Button size="lg" onclick={openAddShockerDialog}>
            <Plus class="size-4" />
            {m.shockers_add()}
          </Button>
        {/if}
      </EmptyState>
    {:else}
      {#if moduleType === ModuleType.SimpleControlModule}
        <SimpleControlHeader bind:shockIntensity bind:vibrationIntensity bind:duration />
      {/if}
      {#if !PUBLIC_DISABLE_SHOCKER_MAP && moduleType === ModuleType.MapControlModule}
        <MapControlModule {shockers} />
      {:else if groupByHub.value}
        <div class="flex w-full flex-col gap-6">
          {#each Array.from(ownHubs) as [hubId, hub] (hubId)}
            {@const online = onlineHubs.get(hubId)?.isOnline ?? false}
            {@const shockerCount = hub.shockers.length}
            <div class="flex w-full flex-col gap-3">
              <div class="flex items-center gap-2">
                <span
                  class="size-2.5 rounded-full {online ? 'bg-success' : 'bg-destructive'}"
                  title={online ? m.common_online() : m.common_offline()}
                ></span>
                <span class="text-lg font-semibold">{hub.name}</span>
                <span class="text-muted-foreground text-xs">
                  {m.shockers_count({ count: shockerCount })}
                </span>
              </div>
              <div class="grid w-full grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4">
                {#each hub.shockers as shocker (shocker.id)}
                  {@render shockerCard(shocker, hubId, false)}
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="grid w-full grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4">
          {#each flatShockers as { shocker, hubId } (shocker.id)}
            {@render shockerCard(shocker, hubId, true)}
          {/each}
        </div>
      {/if}
    {/if}
  {/if}
</Container>
