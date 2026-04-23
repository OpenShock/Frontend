<script lang="ts">
  import Container from '$lib/components/Container.svelte';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';

  registerBreadcrumbs(() => [{ label: 'Profile' }]);
</script>

<Container>
  <h1>Profile</h1>
  <p>Your profile page is coming soon.</p>
</Container>
