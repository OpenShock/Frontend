<script lang="ts">
  import { goto } from '$app/navigation';
  import { accountV2Api } from '$lib/api';
  import Container from '$lib/components/Container.svelte';
  import Turnstile from '$lib/components/Turnstile.svelte';
  import EmailInput from '$lib/components/input/EmailInput.svelte';
  import PasswordInput from '$lib/components/input/PasswordInput.svelte';
  import UsernameInput from '$lib/components/input/UsernameInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { validatePasswordMatch } from '$lib/inputvalidation/passwordValidator';
  import { toast } from 'svelte-sonner';

  let username = $state<string>('');
  let usernameValid = $state<boolean>(false);

  let email = $state('');
  let emailValid = $state(false);

  let password = $state('');
  let passwordValid = $state(false);

  let passwordConfirm = $state('');

  let turnstileResponse = $state<string | null>(null);

  let canSubmit = $derived(
    usernameValid && emailValid && passwordValid && password == passwordConfirm && turnstileResponse
  );

  let accountCreated = $state(false);

  function onOpenChange(open: boolean) {
    if (!open) {
      accountCreated = false;
      toast.success(
        'Account created successfully. Please check your email to verify your account.'
      );
      goto('/login');
    }
  }

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
      .catch(handleApiError)
      .finally(() => {
        turnstileResponse = null;
      });
  }
</script>

<Dialog.Root bind:open={() => accountCreated, onOpenChange}>
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

<Container class="items-center">
  <form class="flex flex-col gap-2" onsubmit={handleSubmission}>
    <div class="text-3xl font-semibold text-nowrap">Sign Up</div>
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
      validate
      showStrengthMeter
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
</Container>
