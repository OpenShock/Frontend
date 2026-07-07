<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { FieldDescription } from '@openshock/svelte-core/components/ui/field';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { getOAuthErrorMessage } from '$lib/auth/oauth-errors';
  import { consumeSearchParam } from '$lib/utils/url';

  registerBreadcrumbs(() => [{ label: 'Authentication Error' }]);

  let errorCode = $state<string>();

  consumeSearchParam('error', async (code) => {
    if (code === 'emailAlreadyRegistered') {
      await goto(resolve(`/login?error=${encodeURIComponent(code)}`), { replaceState: true });
      return false;
    }
    errorCode = code;
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
