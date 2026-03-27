<script lang="ts">
  import { page } from '$app/state';
  import { adminApi } from '$lib/api';
  import type { AdminUsersView, AdminUsersViewPaginated } from '$lib/api/internal/v1';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';

  let user = $state<AdminUsersView | null>(null);

  function handleResponse(page: AdminUsersViewPaginated) {
    if (page.data.length === 0) {
      user = null;
      return;
    }
    if (page.data.length > 1) console.warn('Found more than one user with same ID');
    user = page.data[0];
  }

  $effect(() => {
    adminApi
      .adminGetUsers('id eq ' + page.params.userId)
      .then(handleResponse)
      .catch(handleApiError);
  });
</script>

{user?.name ?? 'Loading...'}
