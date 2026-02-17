<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import Container from '$lib/components/Container.svelte';
  import LoadingCircle from '$lib/components/svg/LoadingCircle.svelte';
  import { UserStore } from '$lib/stores/UserStore';
  import type { Snippet } from 'svelte';

  let { children }: { children?: Snippet } = $props();

  $effect(() => {
    if (!$UserStore.loading && !$UserStore.self) goto(resolve('/login'));
  });
</script>

{#if !$UserStore.self}
  <Container>
    <LoadingCircle class="size-20" />
  </Container>
{:else}
  {@render children?.()}
{/if}
