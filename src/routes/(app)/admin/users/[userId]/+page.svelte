<script lang="ts">
  import { page } from '$app/state';
  import { adminApi } from '$lib/api';
  import type { AdminUsersView, AdminUsersViewPaginated } from '$lib/api/internal/v1';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { breadcrumbs } from '$lib/state/breadcrumbs-state.svelte';

  breadcrumbs.push('Users', '/admin/users');
  const userCrumb = breadcrumbs.push('Loading...');

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

  $effect(() => {
    if (user) userCrumb.label = user.name;
  });
</script>

{user?.name ?? 'Loading...'}
