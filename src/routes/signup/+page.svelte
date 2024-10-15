<script lang="ts">
  import { goto } from '$app/navigation';
  import { accountApi } from '$lib/api';
  import { checkPwnedCount } from '$lib/api/pwnedPasswords';
  import EmailInput from '$lib/components/EmailInput.svelte';
  import PasswordInput from '$lib/components/PasswordInput.svelte';
  import Turnstile from '$lib/components/Turnstile.svelte';
  import UsernameInput from '$lib/components/UsernameInput.svelte';
  import { validatePassword, validatePasswordMatch } from '$lib/inputvalidation/passwordValidator';
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import { getModalStore } from '@skeletonlabs/skeleton';

  const modalStore = getModalStore();

  let username = '';
  let usernameValid = false;

  let email = '';
  let emailValid = false;

  let password = '';
  let passwordValid = false;

  let passwordConfirm = '';
  let passwordConfirmValid = false;

  let turnstileResponse: string | null = null;

  $: canSubmit =
    usernameValid && emailValid && passwordValid && passwordConfirmValid && turnstileResponse;

  function handleSubmission() {
    accountApi
      .accountSignUp({
        username,
        password,
        email,
      })
      .then(() => {
        modalStore.trigger({
          type: 'component',
          component: 'SignUpSuccess',
          response: () => goto('/login'),
        });
      })
      .finally(() => {
        turnstileResponse = null;
      });
  }
</script>

<div class="container h-full mx-auto flex justify-center items-center">
  <form class="flex flex-col space-y-2" on:submit|preventDefault={handleSubmission}>
    <h2 class="h2">Sign Up</h2>

    <UsernameInput bind:value={username} bind:valid={usernameValid} />
    <EmailInput bind:value={email} bind:valid={emailValid} />
    <PasswordInput
      autocomplete="new-password"
      bind:value={password}
      bind:valid={passwordValid}
      validate={true}
      showStrengthMeter={true}
    />
    <PasswordInput
      label="Confirm Password"
      placeholder="Confirm Password"
      autocomplete="new-password"
      bind:value={passwordConfirm}
      bind:valid={passwordConfirmValid}
      validate={validatePasswordMatch(passwordConfirm, password)}
    />

    <Turnstile action="signup" bind:response={turnstileResponse} />

    <button class="btn variant-filled-primary" type="submit" disabled={!canSubmit}>
      Sign Up
    </button>
  </form>
</div>
