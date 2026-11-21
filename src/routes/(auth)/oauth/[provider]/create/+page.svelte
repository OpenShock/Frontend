<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { OAuthSignupFinalize, OAuthSignupGetData } from '#lib/api/next/oauth.js';
  import { EmailInput } from '@openshock/svelte-core/components/input';
  import UsernameInput from '#lib/components/input/UsernameInput.svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { FieldDescription } from '@openshock/svelte-core/components/ui/field';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { userState } from '#lib/state/user-state.svelte.js';
  import { onMount } from 'svelte';
  import { m } from '#lib/paraglide/messages.js';
  import { ParaglideMessage } from '@inlang/paraglide-js-svelte';

  registerBreadcrumbs(() => [
    { label: m.auth_oauth_create_breadcrumb({ provider: page.params.provider ?? 'OAuth' }) },
  ]);

  let username = $state<string>('');
  let usernameValid = $state<boolean>(false);

  let email = $state('');
  let emailValid = $state(false);

  let password = $state('');

  let canSubmit = $derived(usernameValid && emailValid);

  async function handleSubmission(e: SubmitEvent) {
    e.preventDefault();

    if (!username || !email) {
      return;
    }

    try {
      const account = await OAuthSignupFinalize(page.params.provider!, {
        username,
        email,
        password,
      });

      if (!account.isVerified) {
        goto(resolve('login?message=signup-success'));
        return;
      }

      userState.setSelf({
        id: account.accountId,
        name: account.accountName,
        avatar: account.profileImage,
        email: account.accountEmail,
        roles: account.accountRoles,
        hasPassword: false,
      });

      goto(resolve('home'));
    } catch (error) {
      // Let handleApiError surface validation messages via its generic toast.
      await handleApiError(error);
    }
  }

  onMount(() => {
    OAuthSignupGetData(page.params.provider!)
      .then((data) => {
        if (data.displayName) {
          username = data.displayName;
          usernameValid = true;
        }
        if (data.email) {
          email = data.email;
          emailValid = true;
        }
      })
      .catch(async (err) => {
        await handleApiError(err);
        goto(resolve('login'));
      });
  });
</script>

<Card.Root>
  <Card.Header class="text-center">
    <Card.Title class="text-xl">
      <h1>
        <ParaglideMessage
          message={m.auth_oauth_create_title}
          inputs={{ provider: page.params.provider ?? '' }}
        >
          {#snippet provider({ children })}
            <span class="capitalize">{@render children?.()}</span>
          {/snippet}
        </ParaglideMessage>
      </h1>
    </Card.Title>
    <Card.Description>{m.auth_oauth_create_description()}</Card.Description>
  </Card.Header>
  <Card.Content>
    <form class="flex flex-col gap-2" onsubmit={handleSubmission}>
      <UsernameInput
        label={m.auth_oauth_create_username_label()}
        placeholder={m.auth_oauth_create_username_placeholder()}
        bind:value={username}
        bind:valid={usernameValid}
      />
      <EmailInput
        label={m.auth_oauth_create_email_label()}
        placeholder={m.auth_oauth_create_email_placeholder()}
        bind:value={email}
        bind:valid={emailValid}
      />

      <Button type="submit" class="mt-3" disabled={!canSubmit}
        >{m.auth_oauth_create_submit()}</Button
      >
    </form>
  </Card.Content>
</Card.Root>
<FieldDescription class="px-6 text-center">
  <ParaglideMessage message={m.auth_oauth_create_legal}>
    {#snippet tos({ children })}
      <a href="https://openshock.org/tos">{@render children?.()}</a>
    {/snippet}
    {#snippet privacy({ children })}
      <a href="https://openshock.org/privacy">{@render children?.()}</a>
    {/snippet}
  </ParaglideMessage>
</FieldDescription>
