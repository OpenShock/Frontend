<script lang="ts">
  import Container from '$lib/components/Container.svelte';
  import { breadcrumbs } from '$lib/state/breadcrumbs-state.svelte';

  breadcrumbs.push('Home', '/home');
</script>

<Container>Home</Container>
