<script lang="ts">
  import { browser } from '$app/env';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { accountActivate } from '#lib/api/index.js';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { m } from '#lib/paraglide/messages.js';

  registerBreadcrumbs(() => [{ label: m.auth_activate_breadcrumb() }]);

  let token = browser ? page.url.searchParams.get('token') : null;

  let status = $state<'activating' | 'success' | 'failed' | 'missing'>(
    token ? 'activating' : 'missing'
  );

  onMount(() => {
    if (!token) return;
    accountActivate({ query: { token } })
      .then(() => {
        status = 'success';
        toast.success(m.auth_activate_toast_success());
      })
      .catch(async (e: unknown) => {
        status = 'failed';
        await handleApiError(e);
      });
  });
</script>

<Card.Root>
  <Card.Header class="text-center">
    <Card.Title class="text-xl"><h1>{m.auth_activate_title()}</h1></Card.Title>
    <Card.Description>
      {#if status === 'activating'}
        {m.auth_activate_activating()}
      {:else if status === 'success'}
        {m.auth_activate_success()}
      {:else if status === 'failed'}
        {m.auth_activate_failed()}
      {:else}
        {m.auth_activate_missing_token()}
      {/if}
    </Card.Description>
  </Card.Header>
  {#if status === 'success'}
    <Card.Content
      ><Button class="w-full" href={resolve('login')}>{m.auth_activate_continue()}</Button
      ></Card.Content
    >
  {/if}
</Card.Root>
