<script lang="ts">
  import { adminApi } from '$lib/api';
  import { RankType, type AdminOnlineDeviceResponse } from '$lib/api/internal/v1';
  import { UserSelfStore } from '$lib/stores/UserStore';
  import AdminDeviceList from './AdminDeviceList.svelte';

  $: isAdmin = $UserSelfStore?.rank === RankType.admin;

  type FlatDevice = AdminOnlineDeviceResponse & { ownerName: string | null | undefined };

  let devices: FlatDevice[] | null = null;

  $: if (isAdmin && !devices) {
    adminApi
      .adminGetOnlineDevices()
      .then((res) => {
        devices =
          res.data?.map((device) => ({
            ...device,
            ownerName: device.owner?.name,
          })) ?? [];
      })
      .catch((err) => {
        console.error(err);
      });
  }
</script>

<div class="container h-full p-12 flex flex-col justify-start items-start gap-4">
  {#if !isAdmin}
    <h1 class="text-4xl">You do not have permission to access this page</h1>
    <a href="/home" class="btn variant-filled-primary">Go Home</a>
  {:else}
    <div class="flex justify-between w-full">
      <h2 class="h2">Admin Panel</h2>
      <button class="btn variant-filled-primary" on:click={() => (devices = null)}>
        <i class="fa fa-sync" ></i>
        Refresh
      </button>
    </div>

    <!-- Online Users List -->
    {#if devices}
      <div class="flex flex-col space-y-2 w-full">
        <h2 class="h2">Online Users</h2>
        <AdminDeviceList {devices} />
      </div>
    {/if}
  {/if}
</div>
