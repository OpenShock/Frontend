<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { Container } from '@openshock/svelte-core/components';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner';
  import { AuthStatus, authState } from '#lib/state/auth-state.svelte.js';
  import { REDIRECT_QUERY_PARAM } from '#lib/utils/url.js';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  // Safety net: redirect if the user is logged out while inside an (app) page (e.g. session expires mid-session and 401 clears userState).
  // The initial auth gate happens in +layout.ts (load).
  $effect(() => {
    if (authState.status !== AuthStatus.Unauthenticated) return;
    const redirectTo = encodeURIComponent(page.url.pathname + page.url.search);
    void goto(resolve(`login?${REDIRECT_QUERY_PARAM}=${redirectTo}`));
  });
</script>

{#if authState.status !== AuthStatus.Authenticated}
  <Container>
    <Spinner class="size-20 text-gray-600 dark:text-gray-300" />
  </Container>
{:else}
  {@render children()}
{/if}
