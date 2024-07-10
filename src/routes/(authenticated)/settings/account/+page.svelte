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

{#if $UserSelfStore}


<div class="container h-full mx-auto p-12 flex flex-col justify-start items-start gap-4">
  <h1 class="h1">Account Settings</h1>
  <form autocomplete="off"
    class="w-full flex flex-col items-start gap-y-2 p-4 bg-surface-100-800-token rounded-lg border border-gray-500"
    on:submit|preventDefault={handleSubmission}
  >
    <TextInput
      label="Username"
      placeholder={$UserSelfStore.name}
      autocomplete="off"
      bind:value={username}
      validationResult={usernameValres}
    />
    <TextInput
      label="Email"
      placeholder={$UserSelfStore.email}
      autocomplete="off"
      bind:value={email}
      validationResult={emailValres}
    />
    <PasswordInput
      label="Password"
      placeholder="Password"
      autocomplete="off"
      bind:value={password}
      validationResult={passwordValres}
    />
    <PasswordInput
      label="Confirm Password"
      placeholder="Confirm Password"
      autocomplete="off"
      bind:value={passwordConfirm}
      validationResult={passwordConfirmValres}
    />

    <button class="btn variant-filled-primary" type="submit" disabled={!canSubmit}> Update </button>
  </form>
</div>

{/if}

<!-- TODO: Display error -->