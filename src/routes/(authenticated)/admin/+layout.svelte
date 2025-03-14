<script lang="ts">
  import { RoleType } from '$lib/api/internal/v1';
  import { UserStore } from '$lib/stores/UserStore';
  import type { Snippet } from 'svelte';

  type Props = {
    children?: Snippet;
  };

  let { children }: Props = $props();

  const allowedRoles = [RoleType.Admin, RoleType.System];
  let isAdmin = $derived(
    $UserStore.self ? $UserStore.self.roles.some((role) => allowedRoles.includes(role)) : false
  );
</script>

{#if isAdmin}
  {@render children?.()}
{:else}
  <h1 class="text-4xl">You do not have permission to access this page</h1>
  <a href="/home" class="btn variant-filled-primary">Go Home</a>
{/if}
