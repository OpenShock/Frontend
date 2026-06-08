<script lang="ts">
  import { afterNavigate, goto, replaceState } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import * as Card from '$lib/components/ui/card/index.js';
  import { FieldDescription } from '$lib/components/ui/field/index.js';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { getOAuthErrorMessage } from '$lib/auth/oauth-errors';
  import { tick } from 'svelte';

  registerBreadcrumbs(() => [{ label: 'Authentication Error' }]);

  let errorCode = $state<string>();

  afterNavigate(async () => {
    const err = page.url.searchParams.get('error');
    if (err === 'emailAlreadyRegistered') {
      await goto(resolve(`/login?error=${encodeURIComponent(err)}`), { replaceState: true });
      return;
    }
    errorCode = err ?? 'unknown';
    await tick();
    replaceState(resolve('/oauth/error'), {});
  });
</script>

{#if errorCode}
  <Card.Root>
    <Card.Header class="text-center">
      <Card.Title class="text-xl">Authentication Error</Card.Title>
    </Card.Header>
    <Card.Content>
      <p class="text-destructive text-center" role="alert">{getOAuthErrorMessage(errorCode)}</p>
      <FieldDescription class="mt-4 text-center">
        <a href={resolve('/login')}>Back to login</a>
      </FieldDescription>
    </Card.Content>
  </Card.Root>
{/if}
