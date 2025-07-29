<script lang="ts">
  import { DownloadCloud, RotateCcw } from '@lucide/svelte';
  import { page } from '$app/state';
  import { hubManagementV1Api } from '$lib/api';
  import { type OtaItem, OtaUpdateStatus } from '$lib/api/internal/v1';
  import Container from '$lib/components/Container.svelte';
  import FirmwareChannelSelector from '$lib/components/FirmwareChannelSelector.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { Progress } from '$lib/components/ui/progress';
  import * as Table from '$lib/components/ui/table';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { SignalR_Connection } from '$lib/signalr';
  import { type HubOnlineState, OnlineHubsStore } from '$lib/stores/HubsStore';
  import { cn } from '$lib/utils';
  import { NumberToHexPadded } from '$lib/utils/convert';

  let hub = $state<HubOnlineState | null>(null);
  let otaLogs = $state<OtaItem[]>([]);
  let version = $state<string | null>(null);

  function startUpdate() {
    if ($SignalR_Connection === null || hub === null || version === null) return;
    $SignalR_Connection.invoke('OtaInstall', hub.hubId, version);
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
        };
        otaLogs = resp.data;
      })
      .catch(handleApiError)
      .finally(() => (isLoading = false));
  }

  $effect(() => fetchOtaLogs(page.params.hubId));
</script>

<Container>
  <Card.Header>
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">Update Hub</Card.Title>
  </Card.Header>
  <Card.Content class="flex flex-col space-y-3">
    {#if hub}
      <div>
        {#if hub.isOnline}
          <p class="text-green-500">Status: Online</p>
        {:else}
          <p class="text-red-500">Status: Offline</p>
        {/if}
        <p>Firmware Version: {hub.firmwareVersion}</p>
      </div>

      <FirmwareChannelSelector bind:version />

      <Button
        class="cursor-pointer text-xl"
        onclick={startUpdate}
        disabled={$SignalR_Connection === null || hub === null || version === null || !hub.isOnline}
      >
        <DownloadCloud />
        <span> Update to {version} </span>
      </Button>

      <h2 class="text-3xl font-semibold">Progress</h2>
      <div class="grid grid-cols-[auto_1fr] grid-rows-2 items-center gap-2">
        Total
        <Progress value={33} />
        Task
        <Progress value={(hub.otaInstall?.progress ?? 0) * 100} />
      </div>
      <p>{hub.otaInstall?.task}</p>
      <p>Flashing...</p>

      <div class="flex w-full justify-between">
        <h2 class="text-3xl font-semibold">Logs</h2>
        <Button
          class="cursor-pointer text-xl"
          onclick={() => fetchOtaLogs(page.params.hubId)}
          disabled={isLoading}
        >
          <RotateCcw />
          <span> Refresh Logs </span>
        </Button>
      </div>
      <Table.Root class="border-2">
        <Table.Header>
          <Table.Row>
            <Table.Head>ID</Table.Head>
            <Table.Head>Started At</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head>Version</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each otaLogs as otaLog (otaLog.id)}
            <Table.Row>
              <Table.Cell class="font-mono text-blue-200">
                {NumberToHexPadded(otaLog.id, 8)}
              </Table.Cell>
              <Table.Cell class="font-medium">{otaLog.startedAt.toDateString()}</Table.Cell>
              <Table.Cell
                class={cn('font-medium', {
                  'text-red-500': otaLog.status !== OtaUpdateStatus.Finished,
                })}
              >
                {otaLog.status}
              </Table.Cell>
              <Table.Cell class="font-medium">{otaLog.version}</Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    {/if}
  </Card.Content>
</Container>
