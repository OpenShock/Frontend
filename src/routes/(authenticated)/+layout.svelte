<script lang="ts">
  import Container from '$lib/components/Container.svelte';
  import LoadingCircle from '$lib/components/svg/LoadingCircle.svelte';
  import { Button } from '$lib/components/ui/button';
  import { UserStore } from '$lib/stores/UserStore';
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
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
  {@render children?.()}
{/if}
