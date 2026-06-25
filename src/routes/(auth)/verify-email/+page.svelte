<script lang="ts">
  import { browser } from '$app/environment';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { accountEmailVerify } from '$lib/api';
  import { Button } from '$hadcn/button';
  import * as Card from '$hadcn/card';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';

  registerBreadcrumbs(() => [{ label: 'Verify Email' }]);

  let token = browser ? page.url.searchParams.get('token') : null;

  let status = $state<'verifying' | 'success' | 'failed' | 'missing'>(
    token ? 'verifying' : 'missing'
  );

  onMount(() => {
    if (!token) return;
    accountEmailVerify({ query: { token } })
      .then(() => {
        status = 'success';
        toast.success('Email verified');
      })
      .catch(async (e: unknown) => {
        status = 'failed';
        await handleApiError(e);
      });
  });
</script>

<Card.Root>
  <Card.Header class="text-center">
    <Card.Title class="text-xl">Verify Email</Card.Title>
    <Card.Description>
      {#if status === 'verifying'}
        Verifying your email address...
      {:else if status === 'success'}
        Your email has been verified
      {:else if status === 'failed'}
        This verification link is invalid or has expired
      {:else}
        Missing verification token
      {/if}
    </Card.Description>
  </Card.Header>
  {#if status === 'success'}
    <Card.Content>
      <Button class="w-full" href={resolve('/login')}>Continue to login</Button>
    </Card.Content>
  {/if}
</Card.Root>
