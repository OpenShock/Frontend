<script lang="ts">
  import { page } from '$app/state';
  import { adminApi } from '$lib/api';
  import type { AdminUsersView } from '$lib/api/internal/v1';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { onMount } from 'svelte';

  let userId = $derived(page.params.userId);
  let user = $state<AdminUsersView | null>(null);

  onMount(() => {
    adminApi
      .adminGetUsers('id eq ' + userId)
      .then((res) => {
        if (!res.data) return;
        if (res.data.length > 1) console.warn('Found more than one user with same ID');
        user = res.data[0];
      })
      .catch(handleApiError);
  });
</script>

{user?.name ?? 'Loading...'}
