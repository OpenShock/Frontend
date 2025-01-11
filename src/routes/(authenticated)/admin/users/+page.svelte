<script lang="ts">
  import { adminApi } from '$lib/api';
  import type { AdminUsersView } from '$lib/api/internal/v1/models/AdminUsersView';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { onDestroy, onMount } from 'svelte';
  import { columns, type User } from './columns';
  import DataTable from './data-table.svelte';

  import RotateCcw from 'lucide-svelte/icons/rotate-ccw';

  function apiUserToTableDevice(user: AdminUsersView): User {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
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

<div class="container my-8">
  <Card.Header>
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      Users
      <Button class="btn variant-filled-primary text-xl" onclick={fetchUsers}>
        <RotateCcw />
        <span> Refresh </span>
      </Button>
    </Card.Title>
  </Card.Header>
  <Card.Content>
    <DataTable {data} {columns} />
  </Card.Content>
</div>
