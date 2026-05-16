<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { AuthStatus, authState } from '$lib/state/auth-state.svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children?: Snippet } = $props();

  // Safety net: redirect if the user is logged out while inside an (app) page
  // (e.g. session expires mid-session and 401 clears userState).
  // The initial auth gate happens in +layout.ts (load).
  $effect(() => {
    if (authState.status === AuthStatus.Unauthenticated) goto(resolve('/login'));
  });
</script>

{@render children?.()}
