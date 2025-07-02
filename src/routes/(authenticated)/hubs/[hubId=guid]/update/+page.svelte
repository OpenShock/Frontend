<script lang="ts">
  import { DownloadCloud, RotateCcw } from '@lucide/svelte';
  import { page } from '$app/state';
  import { hubManagementV1Api } from '$lib/api';
  import type { OtaItem, OtaItemIReadOnlyCollectionLegacyDataResponse } from '$lib/api/internal/v1';
  import Container from '$lib/components/Container.svelte';
  import FirmwareChannelSelector from '$lib/components/FirmwareChannelSelector.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { Progress } from '$lib/components/ui/progress';
  import * as Table from '$lib/components/ui/table';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { SignalR_Connection } from '$lib/signalr';
  import { type HubOnlineState, OnlineHubsStore } from '$lib/stores/HubsStore';
  import { NumberToHexPadded } from '$lib/utils/convert';

  let hubId = $derived(page.params.hubId);
  let hub = $derived<HubOnlineState>(
    $OnlineHubsStore.get(hubId) ?? {
      hubId,
      isOnline: false,
      firmwareVersion: null,
      otaInstall: null,
    }
  );

  let isValidHubId = $state(false);
  let otaLogs = $state<OtaItem[]>([]);
  let version = $state<string | null>(null);

  function handleGetOtaUpdateHistoryResponse(resp: OtaItemIReadOnlyCollectionLegacyDataResponse) {
    otaLogs = resp.data ?? [];
    isValidHubId = true;
  }

  function startUpdate() {
    if (!isValidHubId || $SignalR_Connection === null || version === null) return;
    $SignalR_Connection.invoke('OtaInstall', hubId, version);
  }

  $effect(() => {
    hubManagementV1Api
      .devicesOtaGetOtaUpdateHistory(hubId)
      .then(handleGetOtaUpdateHistoryResponse)
      .catch(handleApiError);
  });
</script>

<Container>
  <Card.Header>
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">Update Hub</Card.Title>
  </Card.Header>
  <Card.Content class="flex flex-col space-y-3">
    <div>
      {#if hub.isOnline}
        <p class="text-green-500">Status: Online</p>
      {:else}
        <p class="text-red-500">Status: Offline</p>
      {/if}
      <p>Firmware Version: {hub.firmwareVersion}</p>
    </div>

    <FirmwareChannelSelector bind:version />

    <Button class="cursor-pointer text-xl" onclick={startUpdate} disabled={!isValidHubId}>
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
      <Button class="cursor-pointer text-xl" onclick={() => (hubId = hubId)}>
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
            <Table.Cell class={`font-medium${otaLog.status == 'Finished' ? '' : ' text-red-500'}`}>
              {otaLog.status}
            </Table.Cell>
            <Table.Cell class="font-medium">{otaLog.version}</Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </Card.Content>
</Container>
