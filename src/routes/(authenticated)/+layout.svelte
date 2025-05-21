<script lang="ts">
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
  <div class="container mx-auto flex h-full flex-col items-center justify-center gap-4">
    <LoadingCircle class="size-20" />
  </div>
{:else if $UserStore.self === null}
  <div class="container mx-auto flex h-full flex-col items-center justify-center gap-4">
    <h1 class="text-4xl">You need to be logged in to access this page</h1>
    <Button href="/login">Login</Button>
  </div>
{:else}
  {@render children?.()}
{/if}
