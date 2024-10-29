<script lang="ts">
  import { adminApi } from '$lib/api';
  import { RankType, type AdminOnlineDeviceResponse } from '$lib/api/internal/v1';
  import { UserStore } from '$lib/stores/UserStore';
  import { onMount } from 'svelte';
  import AdminDeviceList from './AdminDeviceList.svelte';

  let isAdmin = $derived($UserStore.self?.rank === RankType.admin);

  type FlatDevice = AdminOnlineDeviceResponse & { ownerName: string | null };

  let devices: FlatDevice[] | null = $state(null);

  function fetchOnlineDevices() {
    adminApi
      .adminGetOnlineDevices()
      .then((res) => {
        devices =
          res.data?.map((device) => ({
            ...device,
            ownerName: device.owner ? device.owner.name : null,
          })) ?? [];
      })
      .catch((err) => {
        console.error(err);
      });
  }

  onMount(() => {
    if (isAdmin) fetchOnlineDevices();
  });
</script>

<div class="container h-full p-12 flex flex-col justify-start items-start gap-4">
  {#if !isAdmin}
    <h1 class="text-4xl">You do not have permission to access this page</h1>
    <a href="/home" class="btn variant-filled-primary">Go Home</a>
  {:else}
    <div class="flex justify-between w-full">
      <h2 class="h2">Online Users</h2>
      <button class="btn variant-filled-primary" onclick={fetchOnlineDevices}>
        <i class="fa fa-sync"></i>
        Refresh
      </button>
    </div>

    <!-- Online Users List -->
    {#if devices}
      <AdminDeviceList {devices} />
    {/if}
  {/if}
</div>
