<script lang="ts">
  import { accountLoginV2 } from '$lib/api';
  import { resolve } from '$app/paths';
  import { Button } from '$hadcn/button';
  import * as Card from '$hadcn/card';
  import { FieldGroup, Field, FieldDescription, FieldSeparator } from '$hadcn/field';
  import TextInput from '$core/components/input/TextInput.svelte';
  import type { ValidationResult } from '$core/types/ValidationResult';
  import PasswordInput from '$core/components/input/PasswordInput.svelte';
  import Turnstile from '$lib/components/Turnstile.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { isValidationError, mapToValRes } from '$lib/errorhandling/ValidationProblemDetails';
  import OauthButtons from '$lib/components/auth/oauth-buttons.svelte';
  import { gotoQueryRedirectOrFallback, consumeSearchParam } from '$lib/utils/url';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { backendMetadata } from '$lib/state/backend-metadata-state.svelte';
  import { userState } from '$lib/state/user-state.svelte';
  import { Skeleton } from '$hadcn/skeleton';
  import { getOAuthErrorMessage } from '$lib/auth/oauth-errors';

  registerBreadcrumbs(() => [{ label: 'Login' }]);

  let oauthError = $state<string>();

  consumeSearchParam('error', (code) => {
    oauthError = code;
  });

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
      const account = await accountLoginV2({
        body: { usernameOrEmail, password, turnstileResponse },
      });

      userState.setSelf({
        id: account.accountId,
        name: account.accountName,
        avatar: account.profileImage,
        email: account.accountEmail,
        roles: account.accountRoles,
        hasPassword: true,
      });

      await gotoQueryRedirectOrFallback('/home');
    } catch (error) {
      await handleApiError(error, (problem) => {
        if (!isValidationError(problem)) return false;
        usernameError = mapToValRes(problem, 'UsernameOrEmail');
        passwordError = mapToValRes(problem, 'Password');
        // Only mark the problem as handled if we actually surfaced a field
        // error; otherwise fall through so the generic toast is shown.
        return usernameError !== null || passwordError !== null;
      });
    }
  }

  let providers = $derived(backendMetadata.state?.oAuthProviders ?? []);
  let anyOAuthProviders = $derived(providers.length > 0);

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
    {#if oauthError}
      <p class="text-destructive mb-4 text-center text-sm" role="alert">
        {getOAuthErrorMessage(oauthError)}
      </p>
    {/if}
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
          <OauthButtons {providers} />
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
                forgotHref={resolve('/forgot-password')}
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
  By clicking Login, you agree to our
  <a href="https://openshock.org/tos" target="_blank" rel="noopener">Terms of Service</a>
  and
  <a href="https://openshock.org/privacy" target="_blank" rel="noopener">Privacy Policy</a>.
</FieldDescription>
