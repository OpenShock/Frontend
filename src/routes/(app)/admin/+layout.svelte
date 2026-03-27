<script lang="ts" module>
  import { RoleType } from '$lib/api/internal/v1';

  const allowedRoles = [RoleType.Admin, RoleType.System];
</script>

<script lang="ts">
  import { resolve } from '$app/paths';
  import { Button } from '$lib/components/ui/button';
  import { breadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { userState } from '$lib/state/user-state.svelte';
  import type { Snippet } from 'svelte';

  breadcrumbs.push('Admin', '/admin/users');

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  let isAdmin = $derived(
    userState.self ? userState.self.roles.some((role) => allowedRoles.includes(role)) : false
  );
</script>

{#if isAdmin}
  {@render children?.()}
{:else}
  <h1 class="text-4xl">You do not have permission to access this page</h1>
  <Button href={resolve('/home')}>Go Home</Button>
{/if}
