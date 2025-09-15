<script lang="ts">
  import { page } from '$app/state';
  import { oauthApi } from '$lib/api';
  import { onMount } from 'svelte';

  let provider = $derived(page.params.provider);

  let displayName = $state('');
  let email = $state('');
  let expires = $state<Date | null>(null);

  onMount(() => {
    if (!provider) return;
    oauthApi.oAuthOAuthSignupGetData(provider).then((resp) => {
      if (resp.displayName) displayName = resp.displayName;
      if (resp.email) email = resp.email;
      expires = resp.expiresAt;
    });
  });
</script>

{page.params.provider}
