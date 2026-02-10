<script lang="ts">
  import { AlertTriangle, CheckCircle2, CircleX, DownloadCloud, RotateCcw } from '@lucide/svelte';
  import { page } from '$app/state';
  import { hubManagementV1Api } from '$lib/api';
  import { type OtaItem, OtaUpdateStatus } from '$lib/api/internal/v1';
  import Container from '$lib/components/Container.svelte';
  import FirmwareChannelSelector from '$lib/components/FirmwareChannelSelector.svelte';
  import { Badge } from '$lib/components/ui/badge';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Progress } from '$lib/components/ui/progress';
  import * as Table from '$lib/components/ui/table';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { SignalR_Connection } from '$lib/signalr';
  import { OtaUpdateProgressTask } from '$lib/signalr/models/OtaUpdateProgressTask';
  import { serializeOtaInstallMessage } from '$lib/signalr/serializers/OtaInstall';
  import { breadcrumbs } from '$lib/state/Breadcrumbs.svelte';
  import {
    type HubOnlineState,
    OnlineHubsStore,
    OwnHubsStore,
    refreshOwnHubs,
  } from '$lib/stores/HubsStore';
  import { cn } from '$lib/utils';
  import { NumberToHexPadded } from '$lib/utils/convert';
  import { onMount } from 'svelte';

  // Task weights for weighted total progress (7 tasks, sums to 100)
  const TASK_WEIGHTS = [4, 2, 22, 2, 49, 1, 20];
  const TASK_OFFSETS = [0, 4, 6, 28, 30, 79, 80];

  const TASK_LABELS: Record<OtaUpdateProgressTask, string> = {
    [OtaUpdateProgressTask.FetchingMetadata]: 'Fetching Metadata',
    [OtaUpdateProgressTask.PreparingForUpdate]: 'Preparing for Update',
    [OtaUpdateProgressTask.FlashingFilesystem]: 'Flashing Filesystem',
    [OtaUpdateProgressTask.VerifyingFilesystem]: 'Verifying Filesystem',
    [OtaUpdateProgressTask.FlashingApplication]: 'Flashing Application',
    [OtaUpdateProgressTask.MarkingApplicationBootable]: 'Marking Application Bootable',
    [OtaUpdateProgressTask.Rebooting]: 'Rebooting',
  };

  function calcTotalProgress(task: OtaUpdateProgressTask, progress: number): number {
    return TASK_OFFSETS[task] + progress * TASK_WEIGHTS[task];
  }

  function getStatusBadgeVariant(
    status: OtaUpdateStatus
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case OtaUpdateStatus.Finished:
        return 'default';
      case OtaUpdateStatus.Running:
      case OtaUpdateStatus.Started:
        return 'secondary';
      case OtaUpdateStatus.Error:
      case OtaUpdateStatus.Timeout:
        return 'destructive';
      default:
        return 'outline';
    }
  }

  function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'just now';
  }

  let hub = $state<HubOnlineState | null>(null);
  let otaLogs = $state<OtaItem[]>([]);
  let version = $state<string | null>(null);
  let confirmOpen = $state(false);

  let hubName = $derived($OwnHubsStore.get(page.params.hubId ?? '')?.name ?? 'Unknown Hub');

  let isUpdating = $derived(hub?.otaInstall !== null && hub?.otaInstall !== undefined);

  let totalProgress = $derived(
    hub?.otaInstall ? calcTotalProgress(hub.otaInstall.task, hub.otaInstall.progress) : 0
  );

  let taskProgress = $derived((hub?.otaInstall?.progress ?? 0) * 100);

  let currentTaskLabel = $derived(
    hub?.otaInstall ? (TASK_LABELS[hub.otaInstall.task] ?? 'Unknown Task') : ''
  );

  function startUpdate() {
    if ($SignalR_Connection === null || hub === null || version === null) return;
    // Clear any previous result
    OnlineHubsStore.update((hubs) => {
      const h = hubs.get(hub!.hubId);
      if (h) h.otaResult = null;
      return hubs;
    });
    serializeOtaInstallMessage($SignalR_Connection, hub.hubId, version);
    confirmOpen = false;
  }

  function resetResult() {
    OnlineHubsStore.update((hubs) => {
      const h = hubs.get(hub!.hubId);
      if (h) h.otaResult = null;
      return hubs;
    });
  }

  let isLoading = $state<boolean>(false);
  function fetchOtaLogs(hubId: string | undefined) {
    if (hubId === undefined) {
      hub = null;
      return;
    }

    isLoading = true;
    hubManagementV1Api
      .devicesOtaGetOtaUpdateHistory(hubId)
      .then((resp) => {
        if (resp.data === null) {
          hub = null;
          return;
        }

        hub = $OnlineHubsStore.get(hubId) ?? {
          hubId,
          isOnline: false,
          firmwareVersion: null,
          otaInstall: null,
          otaResult: null,
        };
        otaLogs = resp.data;
      })
      .catch(handleApiError)
      .finally(() => (isLoading = false));
  }

  // Keep hub state in sync with the store
  $effect(() => {
    const hubId = page.params.hubId;
    if (hubId && hub) {
      const storeHub = $OnlineHubsStore.get(hubId);
      if (storeHub) {
        hub = storeHub;
      }
    }
  });

  $effect(() => fetchOtaLogs(page.params.hubId));

  breadcrumbs.push('Hubs', '/hubs');
  breadcrumbs.push('Update');

  onMount(refreshOwnHubs);
</script>

<Dialog.Root bind:open={() => confirmOpen, (o) => (confirmOpen = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Confirm Firmware Update</Dialog.Title>
      <Dialog.Description>
        Update <strong>{hubName}</strong> to version <strong>{version}</strong>?
        {#if version && !version.includes('stable')}
          <p class="mt-2 text-yellow-500">
            This version may not be from the stable channel and could contain bugs.
          </p>
        {/if}
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (confirmOpen = false)}>Cancel</Button>
      <Button onclick={startUpdate}>
        <DownloadCloud class="size-4" />
        Update
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<Container class="w-full max-w-4xl">
  <Card.Header class="w-full">
    <Card.Title class="text-3xl">Update {hubName}</Card.Title>
    <Card.Description>Manage firmware updates for this hub.</Card.Description>
  </Card.Header>
  <Card.Content class="flex w-full flex-col gap-6">
    {#if hub}
      <!-- Status -->
      <div class="flex items-center gap-3">
        <span class="text-muted-foreground text-sm font-medium">Status:</span>
        {#if hub.isOnline}
          <Badge variant="default" class="bg-green-600">Online</Badge>
        {:else}
          <Badge variant="destructive">Offline</Badge>
        {/if}
        {#if hub.firmwareVersion}
          <span class="text-muted-foreground text-sm">
            Firmware: <span class="font-mono">{hub.firmwareVersion}</span>
          </span>
        {/if}
      </div>

      <!-- OTA Result -->
      {#if hub.otaResult}
        <div
          class={cn(
            'flex items-start gap-3 rounded-lg border p-4',
            hub.otaResult.success
              ? 'border-green-500/50 bg-green-500/10'
              : 'border-red-500/50 bg-red-500/10'
          )}
        >
          {#if hub.otaResult.success}
            <CheckCircle2 class="mt-0.5 size-5 shrink-0 text-green-500" />
            <div class="flex flex-col gap-2">
              <p class="font-medium text-green-500">{hub.otaResult.message}</p>
              <Button variant="outline" size="sm" href="/hubs">Back to Hubs</Button>
            </div>
          {:else if hub.otaResult.message.includes('rolled back')}
            <AlertTriangle class="mt-0.5 size-5 shrink-0 text-yellow-500" />
            <div class="flex flex-col gap-2">
              <p class="font-medium text-yellow-500">{hub.otaResult.message}</p>
              <Button variant="outline" size="sm" onclick={resetResult}>Try Again</Button>
            </div>
          {:else}
            <CircleX class="mt-0.5 size-5 shrink-0 text-red-500" />
            <div class="flex flex-col gap-2">
              <p class="font-medium text-red-500">{hub.otaResult.message}</p>
              <Button variant="outline" size="sm" onclick={resetResult}>Try Again</Button>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Firmware Selector + Update Button -->
      {#if !isUpdating && !hub.otaResult}
        <div class="flex flex-col gap-4">
          <div>
            <h3 class="mb-2 text-lg font-semibold">Firmware Channel</h3>
            <FirmwareChannelSelector bind:version disabled={!hub.isOnline} />
          </div>

          <Button
            class="w-fit cursor-pointer text-lg"
            onclick={() => (confirmOpen = true)}
            disabled={$SignalR_Connection === null ||
              hub === null ||
              version === null ||
              !hub.isOnline}
          >
            <DownloadCloud class="size-5" />
            Update to {version ?? '...'}
          </Button>

          {#if !hub.isOnline}
            <p class="text-muted-foreground text-sm">Hub must be online to start an update.</p>
          {/if}
        </div>
      {/if}

      <!-- Progress -->
      {#if isUpdating}
        <div class="flex flex-col gap-4">
          <h3 class="text-lg font-semibold">
            Updating to {hub.otaInstall?.version}...
          </h3>
          <div class="flex flex-col gap-3">
            <div class="grid grid-cols-[5rem_1fr] items-center gap-2">
              <span class="text-muted-foreground text-sm font-medium">Total</span>
              <Progress value={totalProgress} />
            </div>
            <div class="grid grid-cols-[5rem_1fr] items-center gap-2">
              <span class="text-muted-foreground text-sm font-medium">Task</span>
              <Progress value={taskProgress} />
            </div>
          </div>
          <p class="text-muted-foreground text-sm">{currentTaskLabel}</p>
        </div>
      {/if}

      <!-- Logs -->
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Update History</h3>
          <Button
            variant="outline"
            size="sm"
            onclick={() => fetchOtaLogs(page.params.hubId)}
            disabled={isLoading}
          >
            <RotateCcw class={cn('size-4', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        {#if otaLogs.length === 0}
          <p class="text-muted-foreground py-4 text-center text-sm">
            No update history found for this hub.
          </p>
        {:else}
          <Table.Root class="w-full">
            <Table.Header>
              <Table.Row>
                <Table.Head>ID</Table.Head>
                <Table.Head>Started</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Version</Table.Head>
                <Table.Head>Message</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each otaLogs as otaLog (otaLog.id)}
                <Table.Row>
                  <Table.Cell class="text-muted-foreground font-mono text-xs">
                    {NumberToHexPadded(otaLog.id, 8)}
                  </Table.Cell>
                  <Table.Cell class="text-sm" title={otaLog.startedAt.toLocaleString()}>
                    {formatRelativeTime(otaLog.startedAt)}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={getStatusBadgeVariant(otaLog.status)}>
                      {otaLog.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell class="font-mono text-sm">{otaLog.version}</Table.Cell>
                  <Table.Cell class="text-muted-foreground max-w-xs truncate text-sm">
                    {otaLog.message ?? '-'}
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        {/if}
      </div>
    {:else if isLoading}
      <p class="text-muted-foreground">Loading hub information...</p>
    {:else}
      <p class="text-muted-foreground">Hub not found.</p>
    {/if}
  </Card.Content>
</Container>
