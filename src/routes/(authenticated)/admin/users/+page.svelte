<script lang="ts">
  import type { AdminUserResponse } from '$lib/api/internal/v1';
  import { onDestroy, onMount } from 'svelte';
  import { adminApi } from '$lib/api';
  import { handleApiError } from "$lib/errorhandling/apiErrorHandling";
  import { columns, type User } from './columns';
  import DataTable from './data-table.svelte';

  function apiUserToTableDevice(user: AdminUserResponse): User {
    return {
      id: user.id,
      name: user.name ?? 'Unknown',
      email: user.email ?? 'Unknown',
      password_hash_type: user.passwordHashType,
      created_at: user.createdAt,
      email_activated: user.emailActivated,
      rank: user.rank,
    };
  }

  let raw = $state<AdminUserResponse[] | null>(null);
  let data = $derived(raw?.map(apiUserToTableDevice));

  function fetchUsers() {
    adminApi
      .adminGetUsers()
      .then((res) => raw = res?.data ?? null)
      .catch(handleApiError);
  }


  let interval: ReturnType<typeof setInterval>;
  onMount(() => {
    fetchUsers();
    // Trigger refresh every 5 seconds
    interval = setInterval(() => { if (raw) { raw = Object.assign([], raw); } }, 5000);
  });
  onDestroy(() => {
    clearInterval(interval);
  })
</script>

<div class="flex justify-between w-full mb-2">
  <h2 class="text-3xl">Users</h2>
  <button class="btn variant-filled-primary text-xl" onclick={fetchUsers}>
    <i class="fa fa-sync"></i>
    Refresh
  </button>
</div>

{#if data}
  <DataTable {data} {columns} />
{/if}
