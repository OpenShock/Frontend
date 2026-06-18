<script lang="ts">
  import { page } from '$app/state';
  import { adminGetUsers } from '$lib/api';
  import type { AdminUsersView, AdminUsersViewPaginated } from '$lib/api';
  import Container from '$lib/components/Container.svelte';
  import { Spinner } from '$lib/components/ui/spinner';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';

  let user = $state<AdminUsersView | null>(null);
  let loading = $state(true);

  registerBreadcrumbs(() => [
    { label: 'Users', href: '/admin/users' },
    { label: user?.name ?? (loading ? 'Loading...' : 'Not found') },
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
    loading = true;
    adminGetUsers({ query: { $filter: 'id eq ' + page.params.userId } })
      .then(handleResponse)
      .catch(handleApiError)
      .finally(() => (loading = false));
  });
</script>

<Container>
  {#if loading}
    <div class="flex items-center gap-3 p-12">
      <Spinner class="size-5" />
      <span class="text-muted-foreground">Loading user...</span>
    </div>
  {:else if !user}
    <p class="text-muted-foreground p-12">No user found with this ID.</p>
  {:else}
    {user.name}
  {/if}
</Container>
