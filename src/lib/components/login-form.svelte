<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import {
    FieldGroup,
    Field,
    FieldLabel,
    FieldDescription,
    FieldSeparator,
  } from '$lib/components/ui/field/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { cn } from '$lib/utils';
  import type { HTMLAttributes } from 'svelte/elements';
  import { GetOAuthAuthorizeUrl } from '$lib/api/next/oauth';
  import DiscordIcon from './svg/DiscordIcon.svelte';
  import TextInput from './input/TextInput.svelte';
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import PasswordInput from './input/PasswordInput.svelte';
  let { class: className, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
  import Turnstile from '$lib/components/Turnstile.svelte';
  import { resolve } from '$app/paths';
  import { accountV2Api } from '$lib/api';
  import { UserStore } from '$lib/stores/UserStore';
  import { initializeSignalR } from '$lib/signalr';
  import { goto } from '$app/navigation';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { isValidationError, mapToValRes } from '$lib/errorhandling/ValidationProblemDetails';
  import { page } from '$app/state';

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
      goto(page.url.searchParams.get('redirect') ?? '/home');
    } catch (error) {
      await handleApiError(error, (problem) => {
        if (!isValidationError(problem)) return false;
        usernameError = mapToValRes(problem, 'UsernameOrEmail');
        passwordError = mapToValRes(problem, 'Password');
        return true;
      });
    }
  }

  let canSubmit = $derived(
    usernameOrEmail.length > 0 && password.length > 0 && turnstileResponse != null
  );
</script>

<div class={cn('flex max-w-sm flex-col gap-6', className)} {...restProps}>
  <Card.Root>
    <Card.Header class="text-center">
      <Card.Title class="text-xl">Welcome back</Card.Title>
      <Card.Description>Login with your Discord or Twitter account</Card.Description>
    </Card.Header>
    <Card.Content>
      <FieldGroup>
        <Field>
          <form action={GetOAuthAuthorizeUrl('discord', 'LoginOrCreate')} method="POST">
            <Button variant="outline" type="submit" class="w-full"
              ><DiscordIcon /> Login with Discord</Button
            >
          </form>
          <form action={GetOAuthAuthorizeUrl('twitter', 'LoginOrCreate')} method="POST">
            <Button variant="outline" type="submit" class="w-full"
              ><DiscordIcon /> Login with X (Twitter)</Button
            >
          </form>
        </Field>
        <FieldSeparator class="*:data-[slot=field-separator-content]:bg-card">
          Or continue with
        </FieldSeparator>
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
    By clicking continue, you agree to our <a href="##">Terms of Service</a>
    and <a href="##">Privacy Policy</a>.
  </FieldDescription>
</div>
