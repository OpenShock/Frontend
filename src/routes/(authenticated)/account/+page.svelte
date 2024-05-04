<script lang="ts">
  import PasswordInput from '$lib/components/PasswordInput.svelte';
  import TextInput from '$lib/components/TextInput.svelte';
  import { validateEmail } from '$lib/inputvalidation/emailValidator';
  import { validatePassword, validatePasswordMatch } from '$lib/inputvalidation/passwordValidator';
  import { validateUsername } from '$lib/inputvalidation/usernameValidator';
  import { UserSelfStore } from '$lib/stores/UserStore';

  let username: string = '';
  $: usernameValres = validateUsername(username);

  let email: string = '';
  $: emailValres = validateEmail(email);

  let password: string = '';
  $: passwordValres = validatePassword(password);

  let passwordConfirm: string = '';
  $: passwordConfirmValres = validatePasswordMatch(password, passwordConfirm);

  $: canSubmit =
    usernameValres?.valid &&
    emailValres?.valid &&
    passwordValres?.valid &&
    passwordConfirmValres?.valid;

  function handleSubmission() {
    if (!canSubmit) return;

    console.log('Submitting form');

    // TODO: Submit form
  }
</script>

<div class="container h-full mx-auto p-12 flex flex-col justify-start items-start gap-4">
  {#if $UserSelfStore}
    <form class="flex flex-col space-y-2" on:submit|preventDefault={handleSubmission}>
      <h2 class="h2">Account Settings</h2>

      <TextInput
        label="Username"
        placeholder={$UserSelfStore.name}
        autocomplete="username"
        bind:value={username}
        validationResult={usernameValres}
      />
      <TextInput
        label="Email"
        placeholder={$UserSelfStore.email}
        autocomplete="email"
        bind:value={email}
        validationResult={emailValres}
      />
      <PasswordInput
        label="Password"
        placeholder="Password"
        autocomplete="current-password"
        bind:value={password}
        validationResult={passwordValres}
      />
      <PasswordInput
        label="Confirm Password"
        placeholder="Confirm Password"
        autocomplete="current-password"
        bind:value={passwordConfirm}
        validationResult={passwordConfirmValres}
      />

      <button class="btn variant-filled-primary" type="submit" disabled={!canSubmit}>
        Update
      </button>
    </form>
  {:else}
    <p>Loading...</p>
  {/if}
</div>
