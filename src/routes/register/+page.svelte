<script lang="ts">
  import PasswordInput from '$lib/components/PasswordInput.svelte';
  import TextInput from '$lib/components/TextInput.svelte';
  import Turnstile from '$lib/components/Turnstile.svelte';
  import type { ValidationResult } from '$lib/types/ValidationResult';

  let username = '';
  let usernameValres: ValidationResult | null = null;

  let email = '';
  let emailValres: ValidationResult | null = null;

  let password = '';
  let passwordShown = false;
  let passwordValres: ValidationResult | null = null;

  let passwordConfirm = '';
  let passwordConfirmShown = false;
  let passwordConfirmValres: ValidationResult | null = null;

  let turnstileResponse: string | null = null;
</script>

<div class="container h-full mx-auto flex justify-center items-center">
  <form class="flex flex-col space-y-4">
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
      bind:valueShown={passwordShown}
      validationResult={passwordValres}
    />
    <PasswordInput
      label="Confirm Password"
      placeholder="Confirm Password"
      autocomplete="new-password"
      bind:value={passwordConfirm}
      bind:valueShown={passwordConfirmShown}
      validationResult={passwordConfirmValres}
    />

    <Turnstile action="register" bind:response={turnstileResponse} />

    <button class="btn variant-filled-primary" type="submit"> Register </button>
  </form>
</div>
