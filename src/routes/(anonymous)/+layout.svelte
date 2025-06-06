<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { UserStore } from '$lib/stores/UserStore';
  import type { Snippet } from 'svelte';

  let { children }: { children?: Snippet } = $props();

  $effect(() => {
    if (!$UserStore.loading && $UserStore.self) {
      goto(page.url.searchParams.get('redirect') ?? '/login');
    }
  });
</script>

{@render children?.()}
