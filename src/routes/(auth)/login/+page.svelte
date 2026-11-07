<script lang="ts">
  import { accountLoginV2 } from '#lib/api/index.js';
  import { resolve } from '$app/paths';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import {
    FieldGroup,
    Field,
    FieldDescription,
    FieldSeparator,
  } from '@openshock/svelte-core/components/ui/field';
  import { TextInput, PasswordInput } from '@openshock/svelte-core/components/input';
  import type { ValidationResult } from '@openshock/svelte-core/types';
  import Turnstile from '#lib/components/Turnstile.svelte';
  import { describeProblem, handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { fieldErrors } from '#lib/errorhandling/ValidationProblemDetails.js';
  import OauthButtons from '#lib/components/auth/oauth-buttons.svelte';
  import { gotoQueryRedirectOrFallback, consumeSearchParam } from '#lib/utils/url.js';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { backendMetadata } from '#lib/state/backend-metadata-state.svelte.js';
  import { userState } from '#lib/state/user-state.svelte.js';
  import { Skeleton } from '@openshock/svelte-core/components/ui/skeleton';
  import { getOAuthErrorMessage } from '#lib/auth/oauth-errors.js';
  import { MailCheck, KeyRound } from '@lucide/svelte';
  import ResendActivationButton from '#lib/components/auth/resend-activation-button.svelte';

  registerBreadcrumbs(() => [{ label: 'Login' }]);

  let oauthError = $state<string>();

  // Shown after an OAuth signup that still needs activation, and whenever a login attempt (password or
  // OAuth) hits an unactivated account - the API (re)sends the activation email in that case, rate limited.
  let activationPending = $state(false);
  // Picks the wording; the resend button shows itself whenever this browser holds the resend cookie.
  let activationFromSignup = $state(false);
  // Set when a password login hits an account that was created through OAuth and has no password.
  let oauthOnly = $state(false);

  consumeSearchParam('error', (code) => {
    if (code === 'accountNotActivated') {
      activationPending = true;
      return;
    }
    oauthError = code;
  });

  consumeSearchParam('message', (msg) => {
    if (msg === 'signup-success') {
      activationPending = true;
      activationFromSignup = true;
    }
  });

  let usernameOrEmail = $state('');
  let password = $state('');
  let turnstileResponse = $state<string | null>(null);
  let turnstile = $state<Turnstile>();

  let usernameError = $state<ValidationResult | null>(null);
  let passwordError = $state<ValidationResult | null>(null);

  async function handleSubmission(e: SubmitEvent) {
    e.preventDefault();

    if (!usernameOrEmail || !password || !turnstileResponse) {
      return;
    }

    // A new attempt may be for a different account; only re-show the notice if this one is unactivated too.
    activationPending = false;
    activationFromSignup = false;
    oauthOnly = false;
    usernameError = null;
    passwordError = null;

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

      await gotoQueryRedirectOrFallback('home');
    } catch (error) {
      turnstile?.reset();
      await handleApiError(error, {
        'Account.AccountNotActivated': () => {
          activationPending = true;
        },
        'Account.OAuthOnly': () => {
          oauthOnly = true;
        },
        'Login.InvalidCredentials': (problem) => {
          passwordError = { valid: false, message: describeProblem(problem).title };
        },
        'Validation.Error': (problem) => {
          ({ UsernameOrEmail: usernameError, Password: passwordError } = fieldErrors(problem, [
            'UsernameOrEmail',
            'Password',
          ]));
          // Only count as handled if a field error was surfaced; otherwise the generic toast shows.
          return usernameError !== null || passwordError !== null;
        },
      });
    }
  }

  let providers = $derived(backendMetadata.state?.oAuthProviders ?? []);
  let anyOAuthProviders = $derived(providers.length > 0);

  // Without a mail provider the reset link can never be delivered, so don't offer the flow.
  let mailEnabled = $derived(backendMetadata.state?.isMailEnabled ?? true);

  let canSubmit = $derived(
    usernameOrEmail.length > 0 && password.length > 0 && turnstileResponse != null
  );
</script>

<Card.Root>
  <Card.Header class="text-center">
    <Card.Title class="text-xl"><h1>Welcome back</h1></Card.Title>
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
    {#if activationPending}
      <div
        class="bg-muted text-foreground mb-4 flex items-start gap-3 rounded-md border p-3 text-sm"
        role="status"
      >
        <MailCheck class="mt-0.5 size-4 shrink-0" />
        <div class="flex flex-col items-start gap-1">
          {#if activationFromSignup}
            <p>
              Your account has been created. We've sent an activation link to your email address.
              Check your inbox and spam folder.
            </p>
          {:else}
            <p>
              Your account isn't activated yet. We've sent an activation link to your email address.
              Check your inbox and spam folder. If nothing arrives, try logging in again later to
              get a new link.
            </p>
          {/if}
          <ResendActivationButton class="h-auto px-0" />
        </div>
      </div>
    {/if}
    {#if oauthOnly}
      <div
        class="bg-muted text-foreground mb-4 flex items-start gap-3 rounded-md border p-3 text-sm"
        role="alert"
      >
        <KeyRound class="mt-0.5 size-4 shrink-0" />
        <p>
          This account has no password. Sign in with the provider you signed up with
          {#if anyOAuthProviders}using the buttons above{/if}.
        </p>
      </div>
    {/if}
    {#if oauthError}
      <p class="text-destructive mb-4 text-center text-sm" role="alert">
        {getOAuthErrorMessage(oauthError)}
      </p>
    {/if}
    <FieldGroup>
      {#if backendMetadata.state === null}
        <Skeleton class="h-9 w-full" />
        <Skeleton class="h-1 w-full" />
        <Skeleton class="h-9 w-full" />
        <Skeleton class="h-9 w-full" />
        <Skeleton class="h-16 w-full" />
        <Skeleton class="h-9 w-full" />
      {:else}
        {#if anyOAuthProviders}
          <OauthButtons {providers} />
          <FieldSeparator class="*:data-[slot=field-separator-content]:bg-card"
            >Or continue with</FieldSeparator
          >
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
                forgotHref={mailEnabled ? resolve('forgot-password') : undefined}
              />

              <Turnstile
                bind:this={turnstile}
                action="signin"
                onResponse={(response) => (turnstileResponse = response)}
              />
            </div>
            <Field class="mt-5">
              <Button type="submit" disabled={!canSubmit}>Login</Button>
              <FieldDescription class="text-center">
                Don't have an account?
                <a href={resolve('signup')}>Sign up</a>
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
