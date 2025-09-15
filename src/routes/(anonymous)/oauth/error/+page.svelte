<script lang="ts">
  import { page } from '$app/state';

  let error = $derived(page.url.searchParams.get('error'));
</script>

{error}
