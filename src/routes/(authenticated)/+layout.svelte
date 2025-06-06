<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import Container from '$lib/components/Container.svelte';
  import LoadingCircle from '$lib/components/svg/LoadingCircle.svelte';
  import { Button } from '$lib/components/ui/button';
  import { UserStore } from '$lib/stores/UserStore';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  $effect(() => {
    if (!$UserStore.loading && !$UserStore.self) {
      goto(page.url.searchParams.get('redirect') ?? '/login');
    }
  });
</script>

{#if $UserStore.loading}
  <Container>
    <LoadingCircle class="size-20" />
  </Container>
{:else if $UserStore.self === null}
  <Container>
    <h1 class="text-4xl">You need to be logged in to access this page</h1>
    <Button href="/login">Login</Button>
  </Container>
{:else}
  {@render children()}
{/if}
