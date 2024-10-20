<script lang="ts">
  import { goto } from '$app/navigation';
  import { accountApi } from '$lib/api';
  import EmailInput from '$lib/components/input/EmailInput.svelte';
  import PasswordInput from '$lib/components/input/PasswordInput.svelte';
  import Turnstile from '$lib/components/Turnstile.svelte';
  import UsernameInput from '$lib/components/input/UsernameInput.svelte';
  import { validatePasswordMatch } from '$lib/inputvalidation/passwordValidator';
  import { getModalStore } from '@skeletonlabs/skeleton';

  const modalStore = getModalStore();

  let username = $state('');
  let usernameValid = $state(false);

  let email = $state('');
  let emailValid = $state(false);

  let password = $state('');
  let passwordValid = $state(false);

  let passwordConfirm = $state('');

  let turnstileResponse: string | null = $state(null);

  let canSubmit =
    $derived(usernameValid &&
    emailValid &&
    passwordValid &&
    password == passwordConfirm &&
    turnstileResponse);

  function handleSubmission(ev: SubmitEvent) {
    ev.preventDefault();

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
  <form class="flex flex-col space-y-2" onsubmit={handleSubmission}>
    <h2 class="h2">Sign Up</h2>

    <UsernameInput
      label="Username"
      placeholder="Username"
      bind:value={username}
      bind:valid={usernameValid}
    />
    <EmailInput label="Email" placeholder="Email" bind:value={email} bind:valid={emailValid} />
    <PasswordInput
      label="Password"
      placeholder="Password"
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
      validate={validatePasswordMatch(passwordConfirm, password)}
    />

    <Turnstile action="signup" bind:response={turnstileResponse} />

    <button class="btn variant-filled-primary" type="submit" disabled={!canSubmit}>
      Sign Up
    </button>
  </form>
</div>
