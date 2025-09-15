<script lang="ts">
  import { page } from '$app/state';
  import { accountV1Api, oauthApi } from '$lib/api';
  import type { OAuthConnectionResponse } from '$lib/api/internal/v1';
  import { onMount } from 'svelte';

  let status = $derived(page.url.searchParams.get('status'));

  let connections = $state<OAuthConnectionResponse[]>([]);

  onMount(() => {
    accountV1Api.authenticatedAccountListOAuthConnections().then((resp) => {
      connections = resp;
    });
  });
</script>

{status}
{#each connections as connection (connection.providerKey)}
  <div>
    {connection.providerKey}: {connection.displayName}
  </div>
{/each}
