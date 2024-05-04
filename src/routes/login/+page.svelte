<script lang="ts">
  import { goto } from '$app/navigation';
  import { accountApi } from '$lib/api';
  import PasswordInput from '$lib/components/PasswordInput.svelte';
  import TextInput from '$lib/components/TextInput.svelte';
  import { refreshUserSelf } from '$lib/stores/UserStore';
  import type { ValidationResult } from '$lib/types/ValidationResult';

  let usernameOrEmail = '';
  let usernameOrEmailValres: ValidationResult | null = null;

  let password = '';
  let passwordValres: ValidationResult | null = null;

  function handleSubmission() {
    accountApi
      .accountLogin({ email: usernameOrEmail, password })
      .then(() => {
        refreshUserSelf();
        goto('/home');
      })
      .catch((err) => {
        console.error(err);
      });
  }
</script>

<div class="container h-full mx-auto flex justify-center items-center">
  <form class="flex flex-col space-y-4" on:submit|preventDefault={handleSubmission}>
    <h2 class="h2">Login</h2>

    <TextInput
      label="Username or Email"
      placeholder="Username or Email"
      autocomplete="on"
      bind:value={usernameOrEmail}
      validationResult={usernameOrEmailValres}
    />
    <PasswordInput
      label="Password"
      placeholder="Password"
      autocomplete="new-password"
      bind:value={password}
      validationResult={passwordValres}
    />

    <button
      class="btn variant-filled-primary"
      type="submit"
      disabled={usernameOrEmail.length === 0 || password.length === 0}
    >
      Log In
    </button>
  </form>
</div>
