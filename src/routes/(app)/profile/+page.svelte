<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { Container, EmptyState, PageHeader } from '@openshock/svelte-core/components';
  import { UserCircle } from '@lucide/svelte';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';

  registerBreadcrumbs(() => [{ label: m.profile_title() }]);
</script>

<Container>
  <PageHeader title={m.profile_title()} />
  <EmptyState
    icon={UserCircle}
    title={m.profile_coming_soon()}
    description={m.profile_coming_soon_desc()}
  />
</Container>
