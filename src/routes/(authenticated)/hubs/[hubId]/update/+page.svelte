<script lang="ts">
  import { page } from '$app/state';
  import { devicesOtaApi } from '$lib/api';
  import type { OtaItem, OtaItemIReadOnlyCollectionBaseResponse } from '$lib/api/internal/v1';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { OnlineHubsStore, type HubOnlineState } from '$lib/stores/HubsStore';
  import { DownloadCloud, RotateCcw } from '@lucide/svelte';
  import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
  } from '$lib/components/ui/table';
  import FirmwareChannelSelector from '$lib/components/FirmwareChannelSelector.svelte';
  import { SignalR_Connection } from '$lib/signalr';
  import { Progress } from '$lib/components/ui/progress';

  let hubId = $derived(page.params.hubId);
  let hub = $derived<HubOnlineState>($OnlineHubsStore.get(hubId) ?? { hubId, isOnline: false, firmwareVersion: null, otaInstall: null });

  let isValidHubId = $state(false);
  let otaLogs = $state<OtaItem[]>([]);
  let version = $state<string | null>(null);

  function handleGetOtaUpdateHistoryResponse(resp: OtaItemIReadOnlyCollectionBaseResponse){
    otaLogs = resp.data ?? [];
    isValidHubId = true;
  }

  function startUpdate() {
    if (!isValidHubId || $SignalR_Connection === null || version === null) return;
    $SignalR_Connection.invoke('OtaInstall', hubId, version);
  }

  function decimalToHexString(number: number) {
    if (number < 0) {
      number = 0xffffffff + number + 1;
    }

    return number.toString(16).toUpperCase();
  }

  $effect(() => {
    devicesOtaApi
      .devicesOtaGetOtaUpdateHistory(hubId)
      .then(handleGetOtaUpdateHistoryResponse)
      .catch(handleApiError);
  });
</script>

<div class="container my-8">
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
    <div class="grid grid-cols-[auto_1fr] grid-rows-2 gap-2 items-center">
      Total
      <Progress value={33} />
      Task
      <Progress value={(hub.otaInstall?.progress ?? 0) * 100} />
    </div>
    <p>{hub.otaInstall?.step}</p>
    <p>Flashing...</p>

    <div class="flex w-full justify-between">
      <h2 class="text-3xl font-semibold">Logs</h2>
      <Button class="cursor-pointer text-xl" onclick={() => hubId = hubId}>
        <RotateCcw />
        <span> Refresh Logs </span>
      </Button>
    </div>
    <Table class="border-2">
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Started At</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Version</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each otaLogs as otaLog (otaLog.id)}
          <TableRow>
            <TableCell class="font-mono text-blue-200">{decimalToHexString(otaLog.id)}</TableCell>
            <TableCell class="font-medium">{otaLog.startedAt.toDateString()}</TableCell>
            <TableCell class={`font-medium${otaLog.status == 'Finished' ? '' : ' text-red-500'}`}
              >{otaLog.status}</TableCell
            >
            <TableCell class="font-medium">{otaLog.version}</TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  </Card.Content>
</div>
