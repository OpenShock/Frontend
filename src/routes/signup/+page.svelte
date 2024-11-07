<script lang="ts">
  import { accountV2Api } from '$lib/api';
  import EmailInput from '$lib/components/input/EmailInput.svelte';
  import PasswordInput from '$lib/components/input/PasswordInput.svelte';
  import UsernameInput from '$lib/components/input/UsernameInput.svelte';
  import Turnstile from '$lib/components/Turnstile.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import * as Dialog from '$lib/components/ui/dialog';
  import { validatePasswordMatch } from '$lib/inputvalidation/passwordValidator';

  let username = $state('');
  let usernameValid = $state(false);

  let email = $state('');
  let emailValid = $state(false);

  let password = $state('');
  let passwordValid = $state(false);

  let passwordConfirm = $state('');

  let turnstileResponse: string | null = $state(null);

  let canSubmit = $derived(
    usernameValid && emailValid && passwordValid && password == passwordConfirm && turnstileResponse
  );

  let accountCreated = $state(false);

  function handleSubmission(ev: SubmitEvent) {
    ev.preventDefault();

    if (!username || !email || !password || !passwordConfirm || !turnstileResponse) {
      return;
    }

    accountV2Api
      .accountSignUpV2({
        username,
        password,
        email,
        turnstileResponse,
      })
      .then(() => (accountCreated = true))
      .finally(() => {
        turnstileResponse = null;
      });
  }
</script>

{#if accountCreated != null}
  <Dialog.Root>
    <Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Account created</Dialog.Title>
        <Dialog.Description>
          Your account has been created. Please check your email to verify your account.

          <!-- TODO: button to go to login screen -->
        </Dialog.Description>
      </Dialog.Header>
    </Dialog.Content>
  </Dialog.Root>
{/if}

<Card.Root>
  <Card.Header>
    <Card.Title class="text-3xl">Sign Up</Card.Title>
  </Card.Header>
  <Card.Content>
    <form class="flex flex-col space-y-2" onsubmit={handleSubmission}>
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

      <Button type="submit" disabled={!canSubmit}>Sign Up</Button>
    </form>
  </Card.Content>
</Card.Root>
