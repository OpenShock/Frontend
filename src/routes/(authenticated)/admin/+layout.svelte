<script lang="ts">
  import { RankType } from '$lib/api/internal/v1';
  import { UserStore } from '$lib/stores/UserStore';
  import type { Snippet } from 'svelte';

  const allowedRanks = [RankType.Admin, RankType.System];
  let isAdmin = $derived($UserStore.self ? allowedRanks.includes($UserStore.self.rank) : false);

  let { children }: { children?: Snippet } = $props();
</script>

{#if isAdmin}
  {@render children?.()}
{:else}
  <h1 class="text-4xl">You do not have permission to access this page</h1>
  <a href="/home" class="btn variant-filled-primary">Go Home</a>
{/if}
