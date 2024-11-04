<script lang="ts">
  import type { AdminUserResponse } from '$lib/api/internal/v1';
  import { onDestroy, onMount } from 'svelte';
  import { adminApi } from '$lib/api';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
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

  type ApiMethod<TEntity> = (
    filter: string,
    orderby: string,
    offset: number,
    limit: number
  ) => Promise<TEntity[]>;

  type FilterMap<TEntity> = { [K in keyof TEntity]: string };
  type OrderbyQuery<TEntity> = `${Extract<keyof TEntity, string>} ${'asc' | 'desc'}`;
  class QueryApiHandler<TEntity> {
    private apiInstance: ApiMethod<TEntity>;
    private filters = $state<FilterMap<TEntity>>({});
    private orderby = $state<OrderbyQuery<TEntity> | undefined>();
    private offset = $state<number | undefined>();
    private limit = $state<number | undefined>();

    constructor(api: ApiMethod<TEntity>) {
      this.apiInstance = api;
    }

    setFilter(field: keyof TEntity, value: string) {
      this.filters = { ...this.filters, [field]: value };
    }
    clearFilter(field: keyof TEntity) {
      if (field in this.filters) {
        delete this.filters[field];
      }
    }

    setOrderby(field: Extract<keyof TEntity, string>, direction: 'asc' | 'desc') {
      this.orderby = `${field} ${direction}`;
    }
    clearOrderby() {
      this.orderby = undefined;
    }

    setOffset(offset: number) {
      this.offset = offset;
    }
    clearOffset() {
      this.offset = undefined;
    }

    setLimit(limit: number) {
      this.limit = limit;
    }
    clearLimit() {
      this.limit = undefined;
    }

    async fetch() {
      let filter = Object.entries(this.filters)
        .map(([key, value]) => `${key} eq ${value}`)
        .join(' and ');
      let orderby = this.orderby;
      let offset = this.offset;
      let limit = this.limit;

      return this.apiInstance(filter, orderby, offset, limit);
    }
  }

  let data = $state<User[]>([]);

  function fetchUsers() {
    adminApi
      .adminGetUsers(filter, orderby, offset, limit)
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
