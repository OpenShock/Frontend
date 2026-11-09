<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { FieldDescription } from '@openshock/svelte-core/components/ui/field';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { getOAuthErrorMessage } from '#lib/auth/oauth-errors.js';
  import { consumeSearchParam } from '#lib/utils/url.js';
  import { m } from '#lib/paraglide/messages.js';

  registerBreadcrumbs(() => [{ label: m.auth_oauth_error_breadcrumb() }]);

  let errorCode = $state<string>();

  consumeSearchParam('error', async (code) => {
    if (code === 'emailAlreadyRegistered' || code === 'accountNotActivated') {
      await goto(resolve(`login?error=${encodeURIComponent(code)}`), { replace: true });
      return false;
    }
    errorCode = code;
  });
</script>

{#if errorCode}
  <Card.Root>
    <Card.Header class="text-center">
      <Card.Title class="text-xl"><h1>{m.auth_oauth_error_title()}</h1></Card.Title>
    </Card.Header>
    <Card.Content>
      <p class="text-destructive text-center" role="alert">{getOAuthErrorMessage(errorCode)}</p>
      <FieldDescription class="mt-4 text-center"
        ><a href={resolve('login')}>{m.auth_oauth_error_back()}</a></FieldDescription
      >
    </Card.Content>
  </Card.Root>
{/if}
