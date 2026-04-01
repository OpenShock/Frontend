<script lang="ts">
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';

  registerBreadcrumbs(() => [{ label: 'Profile' }]);
</script>

<main>
  <h1>Profile</h1>
  <p>Your profile page is coming soon.</p>
</main>
