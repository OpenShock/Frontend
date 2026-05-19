<script lang="ts">
  import { page } from '$app/state';
  import { adminGetUsers } from '$lib/api';
  import type { AdminUsersView, AdminUsersViewPaginated } from '$lib/api';
  import Container from '$lib/components/Container.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';

  let user = $state<AdminUsersView | null>(null);

  registerBreadcrumbs(() => [
    { label: 'Users', href: '/admin/users' },
    { label: user?.name ?? 'Loading...' },
  ]);

  function handleResponse(page: AdminUsersViewPaginated) {
    if (page.data.length === 0) {
      user = null;
      return;
    }
    if (page.data.length > 1) console.warn('Found more than one user with same ID');
    user = page.data[0];
  }

  $effect(() => {
    adminGetUsers({ query: { $filter: 'id eq ' + page.params.userId } })
      .then(handleResponse)
      .catch(handleApiError);
  });
</script>

<Container>
  {user?.name ?? 'Loading...'}
</Container>
