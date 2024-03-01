<script lang="ts">
  import { adminApi } from '$lib/api';
  import { RankType, type AdminOnlineDeviceResponse as Device } from '$lib/api/internal/v1';
  import { UserSelfStore } from '$lib/stores/UserStore';

  $: isAdmin = $UserSelfStore?.rank === RankType.admin;

  let devices: Device[] = [];

  $: if (isAdmin) {
    adminApi
      .adminGetOnlineDevices()
      .then((res) => {
        devices = res.data ?? [];
      })
      .catch((err) => {
        console.error(err);
      });
  }

  let sortColumn: keyof Device = 'id';
  let sortDirection: 'asc' | 'desc' = 'asc';

  function rowClicked(key: keyof Device) {
    if (sortColumn === key) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = key;
      sortDirection = 'asc';
    }

    let accessor: (d: Device) => string;
    if (sortColumn === 'owner') {
      accessor = (d) => d?.owner?.name?.toLowerCase() ?? '';
    } else {
      accessor = (d) => (d[sortColumn] as string | undefined | null)?.toLowerCase() ?? '';
    }

    let sorter: (a: Device, b: Device) => number;
    if (sortDirection === 'asc') {
      sorter = (a, b) => (accessor(a) > accessor(b) ? 1 : -1);
    } else {
      sorter = (a, b) => (accessor(a) < accessor(b) ? 1 : -1);
    }

    devices = devices.sort(sorter);
  }
</script>

<div class="container h-full p-12 flex flex-col justify-start items-start gap-4">
  {#if !$UserSelfStore}
    <h1 class="text-4xl">You need to be logged in to access this page</h1>
    <a href="/login" class="btn variant-filled-primary">Login</a>
  {:else if !isAdmin}
    <h1 class="text-4xl">You do not have permission to access this page</h1>
    <a href="/home" class="btn variant-filled-primary">Go Home</a>
  {:else}
    <h2 class="h2">Admin Panel</h2>

    <!-- Online Users List -->
    <div class="flex flex-col space-y-2 w-full">
      <div class="flex items-center justify-between px-4">
        <h3 class="h3">Online Users</h3>
        <h4 class="h4">Total: {devices.length}</h4>
      </div>
      <div class="table-container">
        <table class="table table-hover">
          <thead>
            <tr>
              <th class="cursor-pointer select-none" on:click={() => rowClicked('id')}>
                Device ID
              </th>
              <th class="cursor-pointer select-none" on:click={() => rowClicked('name')}>
                Device Name
              </th>
              <th class="cursor-pointer select-none" on:click={() => rowClicked('firmwareVersion')}>
                Firmware Version
              </th>
              <th class="cursor-pointer select-none" on:click={() => rowClicked('gateway')}>
                Gateway
              </th>
              <th class="cursor-pointer select-none" on:click={() => rowClicked('owner')}>
                Owner
              </th>
            </tr>
          </thead>
          <tbody>
            {#each devices as device}
              <tr>
                <td>{device.id}</td>
                <td>{device.name}</td>
                <td class={device.firmwareVersion ? '' : 'text-red-500'}>
                  {device.firmwareVersion}
                </td>
                <td class={device.gateway ? '' : 'text-red-500'}>
                  {device.gateway}
                </td>
                <td class="flex items-center space-x-2">
                  <img class="h-8 rounded-full" src={device.owner?.image} alt="User Avatar" />
                  <p>{device.owner?.name}</p>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
