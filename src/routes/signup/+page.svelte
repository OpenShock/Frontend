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
  let passwordValres: ValidationResult | null = null;
  let passwordDebounce: ReturnType<typeof setTimeout> | null = null;
  $: {
    // Do basic password validation
    const valres = validatePassword(password);
    if (valres?.valid) {
      // Basic validation passed, wait 500ms after the user stops typing
      if (passwordDebounce) clearTimeout(passwordDebounce);
      passwordDebounce = setTimeout(async () => {
        // 500ms has passed, check if the password has been pwned
        const pwnedCount = await checkPwnedCount(password);
        if (pwnedCount > 0) {
          // Password has been pwned, change the validation result
          passwordValres = {
            valid: false,
            message: `Password detected in ${pwnedCount} data breaches`,
          };
        } else {
          // Password is ok, return the successful validation result from the basic validation step
          passwordValres = valres;
        }
      }, 500);
    } else {
      // Basic validation failed, return the failed validation result
      passwordValres = valres;
    }
  }

  let passwordConfirm = '';
  $: passwordConfirmValres = validatePasswordMatch(password, passwordConfirm);

  let turnstileResponse: string | null = null;

  $: canSubmit =
    usernameValid &&
    emailValid &&
    passwordValres?.valid &&
    passwordConfirmValres?.valid &&
    turnstileResponse;

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
      label="Password"
      placeholder="Password"
      autocomplete="new-password"
      bind:value={password}
      validationResult={passwordValres}
      showPasswordStrength={true}
    />
    <PasswordInput
      label="Confirm Password"
      placeholder="Confirm Password"
      autocomplete="new-password"
      bind:value={passwordConfirm}
      validationResult={passwordConfirmValres}
    />

    <Turnstile action="signup" bind:response={turnstileResponse} />

    <button class="btn variant-filled-primary" type="submit" disabled={!canSubmit}>
      Sign Up
    </button>
  </form>
</div>
