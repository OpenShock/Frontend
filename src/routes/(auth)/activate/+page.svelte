<script lang="ts">
  import { browser } from '$app/environment';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { accountActivate } from '$lib/api';
  import Button from '$hadcn/button/button.svelte';
  import * as Card from '$hadcn/card';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';

  registerBreadcrumbs(() => [{ label: 'Activate Account' }]);

  let token = browser ? page.url.searchParams.get('token') : null;

  let status = $state<'activating' | 'success' | 'failed' | 'missing'>(
    token ? 'activating' : 'missing'
  );

  onMount(() => {
    if (!token) return;
    accountActivate({ query: { token } })
      .then(() => {
        status = 'success';
        toast.success('Account activated');
      })
      .catch(async (e: unknown) => {
        status = 'failed';
        await handleApiError(e);
      });
  });
</script>

<Card.Root>
  <Card.Header class="text-center">
    <Card.Title class="text-xl">Activate Account</Card.Title>
    <Card.Description>
      {#if status === 'activating'}
        Activating your account...
      {:else if status === 'success'}
        Your account has been activated
      {:else if status === 'failed'}
        This activation link is invalid or has expired
      {:else}
        Missing activation token
      {/if}
    </Card.Description>
  </Card.Header>
  {#if status === 'success'}
    <Card.Content>
      <Button class="w-full" href={resolve('/login')}>Continue to login</Button>
    </Card.Content>
  {/if}
</Card.Root>
