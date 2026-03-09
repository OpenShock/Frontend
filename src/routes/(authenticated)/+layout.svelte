<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import Container from '$lib/components/Container.svelte';
  import LoadingCircle from '$lib/components/svg/LoadingCircle.svelte';
  import { userState } from '$lib/state/user-state.svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children?: Snippet } = $props();

  $effect(() => {
    if (!userState.loading && !userState.self) goto(resolve('/login'));
  });
</script>

{#if !userState.self}
  <Container>
    <LoadingCircle class="size-20" />
  </Container>
{:else}
  {@render children?.()}
{/if}
