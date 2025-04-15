<script lang="ts">
  import { page } from '$app/state';
  import { deviceApi, devicesOtaApi, devicesV1Api, devicesV2Api } from '$lib/api';
  import type { OtaItem } from '$lib/api/internal/v1';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { OnlineHubsStore } from '$lib/stores/HubsStore';
  import { DownloadCloud, RotateCcw } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
  } from '$lib/components/ui/table';
  import FirmwareChannelSelector from '$lib/components/FirmwareChannelSelector.svelte';

  let hubId = $derived(page.params.hubId);

  let otaLogs = $state<OtaItem[]>([]);
  let onlineInfo = $derived($OnlineHubsStore.get(hubId));
  let isOnline = $derived(onlineInfo?.isOnline ?? false);

  function fetchOtaLogs() {
    devicesOtaApi
      .devicesOtaGetOtaUpdateHistory(hubId)
      .then((resp) => (otaLogs = resp.data ?? []))
      .catch(handleApiError);
  }

  async function startUpdate() {}

  function decimalToHexString(number: number) {
    if (number < 0) {
      number = 0xffffffff + number + 1;
    }

    return number.toString(16).toUpperCase();
  }

  let version = $state<string | null>(null);

  onMount(fetchOtaLogs);
</script>

<div class="container my-8">
  <Card.Header>
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">Update Hub</Card.Title>
  </Card.Header>
  <Card.Content class="flex flex-col space-y-3">
    <div>
      <p class={isOnline ? 'text-green-500' : 'text-red-500'}>
        Status: {isOnline ? 'Online' : 'Offline'}
      </p>
      <p>Firmware Version: {onlineInfo?.firmwareVersion ?? 'Unavailable'}</p>
    </div>

    <FirmwareChannelSelector bind:version />

    {version}

    <Button class="cursor-pointer text-xl" onclick={startUpdate}>
      <DownloadCloud />
      <span> Start Update </span>
    </Button>

    <div class="flex w-full justify-between">
      <h2 class="text-3xl font-semibold">Logs</h2>
      <Button class="cursor-pointer text-xl" onclick={fetchOtaLogs}>
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
