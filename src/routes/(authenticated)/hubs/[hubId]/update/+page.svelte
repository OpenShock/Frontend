<script lang="ts">
  import { page } from '$app/state';
  import { devicesOtaApi } from '$lib/api';
  import type { OtaItem } from '$lib/api/internal/v1';
  import * as Card from '$lib/components/ui/card';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { OnlineHubsStore } from '$lib/stores/HubsStore';
  import { onMount } from 'svelte';

  let hubId = $derived(page.params.hubId);

  let otaLogs = $state<OtaItem[]>([]);
  let onlineInfo = $derived($OnlineHubsStore.get(hubId));

  async function fetchOtaLogs() {
    try {
      const response = await devicesOtaApi.devicesOtaGetOtaUpdateHistory(hubId);
      otaLogs = response.data ?? [];
    } catch (error) {
      handleApiError(error);
    }
  }

  onMount(fetchOtaLogs);
</script>

<div class="container my-8">
  <Card.Header>
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">Update Hub</Card.Title>
    <Card.Description>Here you can update your hub.</Card.Description>
  </Card.Header>
  <Card.Content>
    <!-- Begin Hub Information Section -->
    <h2 class="mb-4 text-xl font-bold">Hub Update Details</h2>
    {#if onlineInfo}
      <p>Hub ID: {onlineInfo.hubId}</p>
      <p>Status: {onlineInfo.isOnline ? 'Online' : 'Offline'}</p>
      <p>Firmware Version: {onlineInfo.firmwareVersion ?? 'N/A'}</p>
    {/if}
    <button onclick={fetchOtaLogs} class="mt-4 rounded bg-blue-500 px-4 py-2 text-white">
      Refresh OTA Logs
    </button>
    <!-- End Hub Information Section -->

    <!-- Begin OTA Logs Section -->
    <h3 class="mt-6 text-lg font-semibold">OTA Update Logs</h3>
    {#if otaLogs.length > 0}
      <ul class="list-disc pl-5">
        {#each otaLogs as log}
          <li class="mt-2">
            <p><strong>ID:</strong> {log.id}</p>
            <p><strong>Status:</strong> {log.status}</p>
            <p><strong>Started At:</strong> {new Date(log.startedAt).toLocaleString()}</p>
            <p><strong>Version:</strong> {log.version}</p>
            {#if log.message}
              <p><strong>Message:</strong> {log.message}</p>
            {/if}
          </li>
        {/each}
      </ul>
    {:else}
      <p class="mt-2">No OTA logs found.</p>
    {/if}
    <!-- End OTA Logs Section -->
  </Card.Content>
</div>
