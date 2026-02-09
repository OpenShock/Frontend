<script lang="ts">
  import { cn } from '$lib/utils';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Field from '$lib/components/ui/field/index.js';
  import type { HTMLAttributes } from 'svelte/elements';
  import UsernameInput from '../input/UsernameInput.svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { accountV2Api } from '$lib/api';
  import Turnstile from '$lib/components/Turnstile.svelte';
  import EmailInput from '$lib/components/input/EmailInput.svelte';
  import PasswordInput from '$lib/components/input/PasswordInput.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { isValidationError, mapToValRes } from '$lib/errorhandling/ValidationProblemDetails';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { validatePasswordMatch } from '$lib/inputvalidation/passwordValidator';
  import { toast } from 'svelte-sonner';
  import FieldSeparator from '../ui/field/field-separator.svelte';
  import OauthButtons from './oauth-buttons.svelte';

  let { class: className, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();

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
      goto(resolve('/login'));
    }
  }

  async function handleSubmission(e: SubmitEvent) {
    e.preventDefault();

    if (!username || !email || !password || !passwordConfirm || !turnstileResponse) {
      return;
    }

    try {
      await accountV2Api.accountSignUpV2({
        username,
        password,
        email,
        turnstileResponse,
      });
      accountCreated = true;
    } catch (error) {
      await handleApiError(error, (problem) => {
        if (!isValidationError(problem)) return false;

        console.log(mapToValRes(problem, 'Username'));
        console.log(mapToValRes(problem, 'Password'));
        console.log(mapToValRes(problem, 'Email'));
        console.log(mapToValRes(problem, 'TurnstileResponse'));

        return true;
      });
    }
  }
</script>

<Dialog.Root bind:open={() => accountCreated, onOpenChange}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Welcome! Thank you for signing up! ❤️</Dialog.Title>
      <Dialog.Description>
        <div class="flex flex-col gap-4">
          <p>Your account has been created. 🎉 Please check your email to verify your account.</p>
          <p>After verifying your email, you can log in to your account.</p>

          <Button variant="default" size="sm" class="mt-4" onclick={() => goto(resolve('/login'))}
            >Ok</Button
          >
        </div>
      </Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>

<div class={cn('flex max-w-sm flex-col gap-6', className)} {...restProps}>
  <Card.Root>
    <Card.Header class="text-center">
      <Card.Title class="text-xl">Create your account</Card.Title>
      <Card.Description>Enter your email below to create your account</Card.Description>
    </Card.Header>
    <Card.Content>
      <Field.Group>
        <OauthButtons />
        <FieldSeparator class="*:data-[slot=field-separator-content]:bg-card">
          Or continue with
        </FieldSeparator>

        <form onsubmit={handleSubmission}>
          <div class="my-1 flex flex-col gap-1">
            <UsernameInput
              label="Username"
              placeholder="John OpenShock"
              bind:value={username}
              bind:valid={usernameValid}
            />
            <EmailInput
              label="Email"
              placeholder="john@example.com"
              bind:value={email}
              bind:valid={emailValid}
            />
            <PasswordInput
              label="Password"
              placeholder="Password"
              autocomplete="new-password"
              bind:value={password}
              bind:valid={passwordValid}
              validate
              showStrengthMeter
              showForget={false}
            />
            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm Password"
              autocomplete="new-password"
              bind:value={passwordConfirm}
              validate={validatePasswordMatch(passwordConfirm, password)}
              showForget={false}
            />
            <Turnstile action="signup" bind:response={turnstileResponse} />
          </div>
          <Field.Field class="mt-5">
            <Button type="submit" disabled={!canSubmit}>Create Account</Button>
            <Field.Description class="text-center">
              Already have an account? <a href={resolve('/login')}>Sign in</a>
            </Field.Description>
          </Field.Field>
        </form>
      </Field.Group>
    </Card.Content>
  </Card.Root>
  <Field.Description class="px-6 text-center">
    By clicking continue, you agree to our <a href="https://openshock.org/tos">Terms of Service</a>
    and <a href="https://openshock.org/privacy">Privacy Policy</a>.
  </Field.Description>
</div>
