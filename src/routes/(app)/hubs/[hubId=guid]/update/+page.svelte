<script lang="ts" module>
  import { OtaUpdateStatus } from '$lib/api/internal/v1';
  import { OtaUpdateProgressTask } from '$lib/signalr/models/OtaUpdateProgressTask';

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

  // Simulated reboot progress (last 20%) — hub goes offline so no more events
  const REBOOT_DURATION_MS = 10_000;
  const REBOOT_INTERVAL_MS = 100;
</script>

<script lang="ts">
  import { CircleCheck, CircleX, CloudDownload, RotateCcw, TriangleAlert } from '@lucide/svelte';
  import { page } from '$app/state';
  import { hubManagementV1Api } from '$lib/api';
  import type { OtaItem } from '$lib/api/internal/v1';
  import Container from '$lib/components/Container.svelte';
  import FirmwareChannelSelector from '$lib/components/FirmwareChannelSelector.svelte';
  import { Badge } from '$lib/components/ui/badge';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Progress } from '$lib/components/ui/progress';
  import * as Table from '$lib/components/ui/table';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { getConnection } from '$lib/signalr/user.svelte';
  import { serializeOtaInstallMessage } from '$lib/signalr/serializers/OtaInstall';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import {
    HubOnlineState,
    onlineHubs,
    ownHubs,
    refreshOwnHubs,
  } from '$lib/state/hubs-state.svelte';
  import { cn } from '$lib/utils';
  import { NumberToHexPadded } from '$lib/utils/convert';
  import { onMount } from 'svelte';
  import type { FirmwareChannel } from '$lib/api/firmwareCDN';

  let hubLoaded = $state(false);
  let otaLogs = $state<OtaItem[]>([]);
  let version = $state<string | null>(null);
  let confirmOpen = $state(false);
  let channel = $state<FirmwareChannel>('stable');

  let hub = $derived.by<HubOnlineState | null>(() => {
    if (!hubLoaded) return null;
    const hubId = page.params.hubId ?? '';
    return onlineHubs.get(hubId) ?? new HubOnlineState(hubId, false, null);
  });

  let hubName = $derived(ownHubs.get(page.params.hubId ?? '')?.name ?? 'Unknown Hub');

  let isUpdating = $derived(hub?.otaInstall !== null && hub?.otaInstall !== undefined);

  let rebootProgress = $state(0);
  let rebootInterval: ReturnType<typeof setInterval> | null = null;

  function stopRebootTimer() {
    if (rebootInterval !== null) {
      clearInterval(rebootInterval);
      rebootInterval = null;
    }
    rebootProgress = 0;
  }

  $effect(() => {
    const isRebooting = hub?.otaInstall?.task === OtaUpdateProgressTask.Rebooting;
    if (isRebooting && rebootInterval === null) {
      rebootProgress = 0;
      const step = REBOOT_INTERVAL_MS / REBOOT_DURATION_MS;
      rebootInterval = setInterval(() => {
        rebootProgress = Math.min(rebootProgress + step, 1);
        if (rebootProgress >= 1 && rebootInterval !== null) {
          clearInterval(rebootInterval);
          rebootInterval = null;
        }
      }, REBOOT_INTERVAL_MS);
    } else if (!isRebooting) {
      stopRebootTimer();
    }

    return stopRebootTimer;
  });

  let totalProgress = $derived.by(() => {
    if (!hub?.otaInstall) return 0;
    if (hub.otaInstall.task === OtaUpdateProgressTask.Rebooting) {
      return (
        TASK_OFFSETS[OtaUpdateProgressTask.Rebooting] +
        rebootProgress * TASK_WEIGHTS[OtaUpdateProgressTask.Rebooting]
      );
    }
    return calcTotalProgress(hub.otaInstall.task, hub.otaInstall.progress);
  });

  let taskProgress = $derived.by(() => {
    if (hub?.otaInstall?.task === OtaUpdateProgressTask.Rebooting) {
      return rebootProgress * 100;
    }
    return (hub?.otaInstall?.progress ?? 0) * 100;
  });

  let currentTaskLabel = $derived(
    hub?.otaInstall ? (TASK_LABELS[hub.otaInstall.task] ?? 'Unknown Task') : ''
  );

  function startUpdate() {
    const hubId = page.params.hubId;
    const conn = getConnection();
    if (conn === null || !hubId || hub === null || version === null) return;
    // Clear any previous result
    const h = onlineHubs.get(hubId);
    if (h) h.otaResult = null;
    serializeOtaInstallMessage(conn, hubId, version);
    confirmOpen = false;
  }

  function resetResult() {
    const hubId = page.params.hubId;
    if (!hubId) return;
    const h = onlineHubs.get(hubId);
    if (h) h.otaResult = null;
  }

  let isLoading = $state<boolean>(false);
  function fetchOtaLogs(hubId: string | undefined) {
    if (hubId === undefined) {
      hubLoaded = false;
      isLoading = false;
      otaLogs = [];
      return;
    }

    isLoading = true;
    hubManagementV1Api
      .devicesOtaGetOtaUpdateHistory(hubId)
      .then((resp) => {
        if (resp.data === null) {
          hubLoaded = false;
          return;
        }

        hubLoaded = true;
        otaLogs = resp.data;
      })
      .catch(handleApiError)
      .finally(() => (isLoading = false));
  }

  $effect(() => fetchOtaLogs(page.params.hubId));

  registerBreadcrumbs(() => [{ label: 'Hubs', href: '/hubs' }, { label: hubName ?? 'Update' }]);

  onMount(refreshOwnHubs);
</script>

<Dialog.Root bind:open={() => confirmOpen, (o) => (confirmOpen = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Confirm Firmware Update</Dialog.Title>
      <Dialog.Description>
        Update <strong>{hubName}</strong> to version <strong>{version}</strong>?
        {#if channel !== 'stable'}
          <p class="mt-2 text-yellow-500">
            This version may not be from the stable channel and could contain bugs.
          </p>
        {/if}
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (confirmOpen = false)}>Cancel</Button>
      <Button onclick={startUpdate}>
        <CloudDownload class="size-4" />
        Update
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<Container>
  <Card.Header class="w-full">
    <Card.Title class="text-3xl">Update {hubName}</Card.Title>
    <Card.Description>Manage firmware updates for this hub.</Card.Description>
  </Card.Header>
  <Card.Content class="flex w-full flex-col gap-6">
    {#if hub}
      <!-- Status -->
      <Card.Root>
        <Card.Header>
          <Card.Title class="text-base">Hub Status</Card.Title>
        </Card.Header>
        <Card.Content>
          <div class="flex flex-wrap items-center gap-3">
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
        </Card.Content>
      </Card.Root>

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
            <CircleCheck class="mt-0.5 size-5 shrink-0 text-green-500" />
            <div class="flex flex-col gap-2">
              <p class="font-medium text-green-500">{hub.otaResult.message}</p>
              <div class="flex gap-2">
                <Button variant="outline" size="sm" href="/hubs">Back to Hubs</Button>
                <Button variant="outline" size="sm" onclick={resetResult}>Flash Again</Button>
              </div>
            </div>
          {:else if hub.otaResult.message.includes('rolled back')}
            <TriangleAlert class="mt-0.5 size-5 shrink-0 text-yellow-500" />
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
        <Card.Root>
          <Card.Header>
            <Card.Title class="text-base">Firmware Update</Card.Title>
            <Card.Description>Select a firmware channel and version to install.</Card.Description>
          </Card.Header>
          <Card.Content class="flex flex-col gap-4">
            <FirmwareChannelSelector bind:channel bind:version disabled={!hub.isOnline} />

            <Button
              class="w-fit cursor-pointer"
              onclick={() => (confirmOpen = true)}
              disabled={getConnection() === null ||
                hub === null ||
                version === null ||
                !hub.isOnline}
            >
              <CloudDownload class="size-4" />
              Update to {version ?? '...'}
            </Button>

            {#if !hub.isOnline}
              <p class="text-muted-foreground text-sm">Hub must be online to start an update.</p>
            {/if}
          </Card.Content>
        </Card.Root>
      {/if}

      <!-- Progress -->
      {#if isUpdating}
        <Card.Root>
          <Card.Header>
            <Card.Title class="text-base">
              Updating to {hub.otaInstall?.version}...
            </Card.Title>
          </Card.Header>
          <Card.Content class="flex flex-col gap-4">
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
          </Card.Content>
        </Card.Root>
      {/if}

      <!-- Logs -->
      <Card.Root>
        <Card.Header>
          <Card.Title class="flex items-center justify-between text-base">
            Update History
            <Button
              variant="outline"
              size="sm"
              onclick={() => fetchOtaLogs(page.params.hubId)}
              disabled={isLoading}
            >
              <RotateCcw class={cn('size-4', isLoading && 'animate-spin')} />
              Refresh
            </Button>
          </Card.Title>
        </Card.Header>
        <Card.Content>
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
        </Card.Content>
      </Card.Root>
    {:else if isLoading}
      <p class="text-muted-foreground">Loading hub information...</p>
    {:else}
      <p class="text-muted-foreground">Hub not found.</p>
    {/if}
  </Card.Content>
</Container>
