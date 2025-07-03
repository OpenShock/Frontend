<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { accountV2Api } from '$lib/api';
  import Container from '$lib/components/Container.svelte';
  import Turnstile from '$lib/components/Turnstile.svelte';
  import PasswordInput from '$lib/components/input/PasswordInput.svelte';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import {
    type ValidationProblemDetails,
    isValidationError,
  } from '$lib/errorhandling/ValidationProblemDetails';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { UserStore } from '$lib/stores/UserStore';
  import type { ValidationResult } from '$lib/types/ValidationResult';

  let usernameOrEmail = $state('');
  let password = $state('');
  let turnstileResponse = $state<string | null>(null);

  let usernameError = $state<ValidationResult | null>(null);
  let passwordError = $state<ValidationResult | null>(null);

  function mapToValRes(problem: ValidationProblemDetails, key: string): ValidationResult | null {
    const errors = problem.errors[key];
    return errors ? { valid: false, message: errors[0] } : null;
  }

  async function handleSubmission(e: SubmitEvent) {
    e.preventDefault();

    if (!usernameOrEmail || !password || !turnstileResponse) {
      return;
    }

    try {
      await accountV2Api.accountLoginV2({ usernameOrEmail, password, turnstileResponse });
      await UserStore.refreshSelf();
      goto(page.url.searchParams.get('redirect') ?? '/home');
    } catch (error) {
      handleApiError(error, (problem) => {
        if (!isValidationError(problem)) return true;
        usernameError = mapToValRes(problem, 'UsernameOrEmail');
        passwordError = mapToValRes(problem, 'Password');
        return false;
      });
    }
  }

  let canSubmit = $derived(
    usernameOrEmail.length > 0 && password.length > 0 && turnstileResponse != null
  );
</script>

<Container class="items-center">
  <form class="flex flex-col gap-2" onsubmit={handleSubmission}>
    <div class="text-3xl font-semibold">Login</div>

    <TextInput
      label="Username or Email"
      placeholder="Username or Email"
      autocomplete="on"
      bind:value={usernameOrEmail}
      validationResult={usernameError}
    />

    <PasswordInput
      label="Password"
      placeholder="Password"
      autocomplete="new-password"
      bind:value={password}
      validate={passwordError}
    />

    <Turnstile action="signin" bind:response={turnstileResponse} />

    <Button type="submit" disabled={!canSubmit}>Log In</Button>

    <a class="text-blue-500 underline" href="/forgot-password">I forgot my password</a>
  </form>
</Container>
