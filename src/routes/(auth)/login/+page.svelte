<script lang="ts">
  import { resolve } from '$app/paths';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import {
    FieldGroup,
    Field,
    FieldDescription,
    FieldSeparator,
  } from '$lib/components/ui/field/index.js';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import PasswordInput from '$lib/components/input/PasswordInput.svelte';
  import Turnstile from '$lib/components/Turnstile.svelte';
  import { accountV2Api } from '$lib/api';
  import { userState } from '$lib/state/user-state.svelte';
  import { initializeSignalR } from '$lib/signalr/user.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { isValidationError, mapToValRes } from '$lib/errorhandling/ValidationProblemDetails';
  import OauthButtons from '$lib/components/auth/oauth-buttons.svelte';
  import { gotoQueryRedirectOrFallback } from '$lib/utils/url';
  import { backendMetadata } from '$lib/state/backend-metadata-state.svelte';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

  let usernameOrEmail = $state('');
  let password = $state('');
  let turnstileResponse = $state<string | null>(null);

  let usernameError = $state<ValidationResult | null>(null);
  let passwordError = $state<ValidationResult | null>(null);

  async function handleSubmission(e: SubmitEvent) {
    e.preventDefault();

    if (!usernameOrEmail || !password || !turnstileResponse) {
      return;
    }

    try {
      const account = await accountV2Api.accountLoginV2({
        usernameOrEmail,
        password,
        turnstileResponse,
      });
      userState.setSelf({
        id: account.accountId,
        name: account.accountName,
        avatar: account.profileImage,
        email: account.accountEmail,
        roles: account.accountRoles,
      });
      await initializeSignalR();

      await gotoQueryRedirectOrFallback('/home');
    } catch (error) {
      await handleApiError(error, (problem) => {
        if (!isValidationError(problem)) return false;
        usernameError = mapToValRes(problem, 'UsernameOrEmail');
        passwordError = mapToValRes(problem, 'Password');
        return true;
      });
    }
  }

  let oauthProviders = $derived(backendMetadata.state?.oAuthProviders);
  let anyOAuthProviders = $derived(oauthProviders !== undefined && oauthProviders.length > 0);

  let canSubmit = $derived(
    usernameOrEmail.length > 0 && password.length > 0 && turnstileResponse != null
  );
</script>

<Card.Root>
  <Card.Header class="text-center">
    <Card.Title class="text-xl">Welcome back</Card.Title>
    <Card.Description>
      {#if backendMetadata.state === null}
        Loading available login methods
      {:else if anyOAuthProviders}
        Login with one of these methods
      {:else}
        Login with your OpenShock Account
      {/if}
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <FieldGroup>
      {#if backendMetadata.state === null}
        <Skeleton class="h-9 w-full"></Skeleton>
        <Skeleton class="h-1 w-full"></Skeleton>
        <Skeleton class="h-9 w-full"></Skeleton>
        <Skeleton class="h-9 w-full"></Skeleton>
        <Skeleton class="h-16 w-full"></Skeleton>
        <Skeleton class="h-9 w-full"></Skeleton>
      {:else}
        {#if anyOAuthProviders}
          <OauthButtons />
          <FieldSeparator class="*:data-[slot=field-separator-content]:bg-card">
            Or continue with
          </FieldSeparator>
        {/if}
        <form onsubmit={handleSubmission}>
          <div>
            <div class="my-1 flex flex-col gap-1">
              <TextInput
                label="Username or Email"
                autocomplete="username"
                bind:value={usernameOrEmail}
                validationResult={usernameError}
              />

              <PasswordInput
                label="Password"
                autocomplete="current-password"
                bind:value={password}
                validate={passwordError}
              />

              <Turnstile
                action="signin"
                onResponse={(response) => (turnstileResponse = response)}
              />
            </div>
            <Field class="mt-5">
              <Button type="submit" disabled={!canSubmit}>Login</Button>
              <FieldDescription class="text-center">
                Don't have an account? <a href={resolve('/signup')}>Sign up</a>
              </FieldDescription>
            </Field>
          </div>
        </form>
      {/if}
    </FieldGroup>
  </Card.Content>
</Card.Root>
<FieldDescription class="px-6 text-center">
  By clicking Login, you agree to our <a href="https://openshock.org/tos" target="_blank"
    >Terms of Service</a
  >
  and <a href="https://openshock.org/privacy" target="_blank">Privacy Policy</a>.
</FieldDescription>
