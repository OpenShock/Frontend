<script lang="ts">
  import { page } from '$app/state';
  import Container from '$lib/components/Container.svelte';

  let error = $derived(page.url.searchParams.get('error'));
</script>

<Container class="items-center">
  <h1 class="text-3xl font-semibold">Authentication Error</h1>
  <p role="alert">{error}</p>
</Container>
