<script lang="ts">
  import Container from '$lib/components/Container.svelte';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';

  registerBreadcrumbs(() => [{ label: 'Hangfire' }]);
</script>

<Container>
  <h1 class="text-center text-8xl font-bold">
    This is not supposed to be visible in prod<br />
    Hangfire is supposed to be here
  </h1>
</Container>
