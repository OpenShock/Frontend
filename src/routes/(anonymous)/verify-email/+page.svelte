<script lang="ts">
  import { page } from '$app/state';
  import Container from '$lib/components/Container.svelte';

  let secret = page.url.searchParams.get('token');
</script>

<Container class="items-center">
  <h1 class="text-3xl font-semibold">Verify Email</h1>

  {secret}
</Container>
