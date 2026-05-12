<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { userState } from '$lib/state/user-state.svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children?: Snippet } = $props();

  // Safety net: redirect if the user is logged out while inside an (app) page.
  // The initial auth gate happens in +layout.ts (load).
  $effect(() => {
    if (!userState.loading && !userState.self) goto(resolve('/login'));
  });
</script>

{@render children?.()}
