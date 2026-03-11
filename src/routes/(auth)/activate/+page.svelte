<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { accountV1Api } from '$lib/api';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';

  let secret = browser && page.url.searchParams.get('token');

  function activateAccount() {
    if (!secret) return;
    accountV1Api
      .accountActivate(secret)
      .then(() => goto(resolve('/login')))
      .catch(handleApiError);
  }
</script>

<Card.Root>
  <Card.Header class="text-center">
    <Card.Title class="text-xl">Activate Account</Card.Title>
    <Card.Description>Click the button below to activate your account</Card.Description>
  </Card.Header>
  <Card.Content>
    <Button class="w-full" onclick={activateAccount}>Activate Account</Button>
  </Card.Content>
</Card.Root>
