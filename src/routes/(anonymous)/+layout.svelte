<script lang="ts">
  import { UserStore } from '$lib/stores/UserStore';
  import { gotoQueryRedirectOrFallback } from '$lib/utils/url';
  import type { Snippet } from 'svelte';

  let { children }: { children?: Snippet } = $props();

  $effect(() => {
    if (!$UserStore.loading && $UserStore.self) {
      gotoQueryRedirectOrFallback('/home', 'redirect');
    }
  });
</script>

{@render children?.()}
