<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { accountV1Api } from '$lib/api';
  import Container from '$lib/components/Container.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';

  let secret = page.url.searchParams.get('token');

  function activateAccount() {
    if (!secret) return;
    accountV1Api
      .accountActivate(secret)
      .then(() => goto('/login'))
      .catch(handleApiError);
  }
</script>

<Container class="items-center">
  <div class="text-3xl font-semibold">Activate Account</div>

  {secret}

  <Button class="mt-4" onclick={activateAccount}>Activate Account</Button>
</Container>
