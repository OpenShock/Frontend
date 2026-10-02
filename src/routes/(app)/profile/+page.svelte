<script lang="ts">
  import { Container, EmptyState, PageHeader } from '@openshock/svelte-core/components';
  import { UserCircle } from '@lucide/svelte';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';

  registerBreadcrumbs(() => [{ label: 'Profile' }]);
</script>

<Container>
  <PageHeader title="Profile" />
  <EmptyState
    icon={UserCircle}
    title="Profile is coming soon"
    description="Your public profile is not available yet. Account details live under Settings."
  />
</Container>
