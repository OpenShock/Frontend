<script lang="ts">
  import Container from '$lib/components/Container.svelte';
  import { asset, resolve } from '$app/paths';
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
  import { UserStore } from '$lib/stores/UserStore';
  import { initializeSignalR } from '$lib/signalr';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { isValidationError, mapToValRes } from '$lib/errorhandling/ValidationProblemDetails';
  import OauthButtons from '$lib/components/auth/oauth-buttons.svelte';
  import { gotoQueryRedirectOrFallback } from '$lib/utils/url';
  import { backendMetadata } from '$lib/state/BackendMetadata.svelte';

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
      UserStore.setSelf({
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

  let oauthProviders = $derived(backendMetadata.State?.oAuthProviders);
  function isArrayPopulated<T>(array: T[] | undefined): array is T[] {
    return array !== undefined && array.length > 0;
  }

  let canSubmit = $derived(
    usernameOrEmail.length > 0 && password.length > 0 && turnstileResponse != null
  );
</script>

<Container class="items-center-safe justify-center-safe p-4">
  <span class="flex items-center gap-2 self-center font-medium">
    <img class="ml-[0.667px] h-7.5" src={asset('/IconSpinning.svg')} alt="OpenShock Logo" />
    <img
      class="h-7.5 transition-opacity delay-100 duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:delay-0"
      src={asset('/LogoTextOnly.svg')}
      alt="OpenShock Logo"
    />
  </span>
  <div class="flex max-w-sm flex-col gap-6">
    <Card.Root>
      <Card.Header class="text-center">
        <Card.Title class="text-xl">Welcome back</Card.Title>
        {#if isArrayPopulated(oauthProviders)}
          {#if oauthProviders.length === 1}
            <Card.Description>Login with your {oauthProviders[0]} account</Card.Description>
          {:else if oauthProviders.length === 2}
            <Card.Description
              >Login with your {oauthProviders[0]} or {oauthProviders[1]} account</Card.Description
            >
          {:else}
            <Card.Description>Login with one of the following</Card.Description>
          {/if}
        {/if}
      </Card.Header>
      <Card.Content>
        <FieldGroup>
          <OauthButtons />
          {#if isArrayPopulated(oauthProviders)}
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

                <Turnstile action="signin" bind:response={turnstileResponse} />
              </div>
              <Field class="mt-5">
                <Button type="submit" disabled={!canSubmit}>Login</Button>
                <FieldDescription class="text-center">
                  Don't have an account? <a href={resolve('/signup')}>Sign up</a>
                </FieldDescription>
              </Field>
            </div>
          </form>
        </FieldGroup>
      </Card.Content>
    </Card.Root>
    <FieldDescription class="px-6 text-center">
      By clicking continue, you agree to our <a href="https://openshock.org/tos" target="_blank"
        >Terms of Service</a
      >
      and <a href="https://openshock.org/privacy" target="_blank">Privacy Policy</a>.
    </FieldDescription>
  </div>
</Container>
