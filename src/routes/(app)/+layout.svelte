<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { Container } from '@openshock/svelte-core/components';
  import { Spinner } from '@openshock/svelte-core/ui/spinner';
  import { AuthStatus, authState } from '$lib/state/auth-state.svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  // Safety net: redirect if the user is logged out while inside an (app) page (e.g. session expires mid-session and 401 clears userState).
  // The initial auth gate happens in +layout.ts (load).
  $effect(() => {
    if (authState.status !== AuthStatus.Unauthenticated) return;
    const next = encodeURIComponent(page.url.pathname + page.url.search);
    void goto(resolve(`/login?next=${next}`));
  });
</script>

{#if authState.status !== AuthStatus.Authenticated}
  <Container>
    <Spinner class="size-20 text-gray-600 dark:text-gray-300" />
  </Container>
{:else}
  {@render children()}
{/if}
