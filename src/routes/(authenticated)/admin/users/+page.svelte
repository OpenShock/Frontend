<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { adminApi } from '$lib/api';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { columns, type User } from './columns';
  import DataTable from './data-table.svelte';
  import type { AdminUsersView } from '$lib/api/internal/v1/models/AdminUsersView';

  function apiUserToTableDevice(user: AdminUsersView): User {
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

  type FilterOpType =
    | 'like'
    | '=='
    | 'eq'
    | '!='
    | 'neq'
    | '<'
    | 'lt'
    | '>'
    | 'gt'
    | '<='
    | 'lte'
    | '>='
    | 'gte';
  type Filter<TEntity> = `${Extract<keyof TEntity, string>} ${FilterOpType} ${string}`;
  type FilterMap<TEntity> = { [K in keyof TEntity]: string };
  type OrderbyQuery<TEntity> = `${Extract<keyof TEntity, string>} ${'asc' | 'desc'}`;

  let data = $state<User[]>([]);

  function fetchUsers() {
    adminApi
      .adminGetUsers() /* filter, orderby, offset, limit */
      .then((res) => {
        if (res.data) {
          data = res.data.map(apiUserToTableDevice);
        }
      })
      .catch(handleApiError);
  }

  let interval: ReturnType<typeof setInterval>;
  onMount(() => {
    fetchUsers();
    // Update timestamps every minute
    interval = setInterval(() => {
      data = Object.assign([], data);
    }, 60000);
  });
  onDestroy(() => {
    clearInterval(interval);
  });
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
