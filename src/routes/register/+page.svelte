<script lang="ts">
  import { checkPwnedCount } from '$lib/api/pwnedPasswords';
  import PasswordInput from '$lib/components/PasswordInput.svelte';
  import TextInput from '$lib/components/TextInput.svelte';
  import Turnstile from '$lib/components/Turnstile.svelte';
  import { validateEmail } from '$lib/inputvalidation/emailValidator';
  import { validatePassword, validatePasswordMatch } from '$lib/inputvalidation/passwordValidator';
  import { validateUsername } from '$lib/inputvalidation/usernameValidator';
  import type { ValidationResult } from '$lib/types/ValidationResult';

  let username = '';
  $: usernameValres = validateUsername(username);

  let email = '';
  $: emailValres = validateEmail(email);

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
    usernameValres?.valid &&
    emailValres?.valid &&
    passwordValres?.valid &&
    passwordConfirmValres?.valid &&
    turnstileResponse;
</script>

<div class="container h-full mx-auto flex justify-center items-center">
  <form class="flex flex-col space-y-2">
    <h2 class="h2">Register</h2>

    <TextInput
      label="Username"
      placeholder="Username"
      autocomplete="username"
      bind:value={username}
      validationResult={usernameValres}
    />
    <TextInput
      label="Email"
      placeholder="Email"
      autocomplete="email"
      bind:value={email}
      validationResult={emailValres}
    />
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

    <Turnstile action="register" bind:response={turnstileResponse} />

    <button class="btn variant-filled-primary" type="submit" disabled={!canSubmit}>
      Register
    </button>
  </form>
</div>
