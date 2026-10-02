<script lang="ts">
  import { Container, EmptyState, PageHeader } from '@openshock/svelte-core/components';
  import { Clock } from '@lucide/svelte';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';

  registerBreadcrumbs(() => [{ label: 'Hangfire' }]);
</script>

<Container>
  <PageHeader title="Hangfire" subtitle="Background job dashboard for this instance." />
  <EmptyState
    icon={Clock}
    title="Dashboard not embedded"
    description="The Hangfire dashboard is served by the backend rather than from this page."
  />
</Container>
