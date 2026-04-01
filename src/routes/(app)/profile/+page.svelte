<script lang="ts">
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';

  registerBreadcrumbs(() => [{ label: 'Profile' }]);
</script>
