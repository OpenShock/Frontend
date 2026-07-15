<script lang="ts">
  import { accountSignUpV2 } from '$lib/api';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import * as Field from '@openshock/svelte-core/components/ui/field';
  import UsernameInput from '$lib/components/input/UsernameInput.svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import Turnstile from '$lib/components/Turnstile.svelte';
  import { EmailInput } from '@openshock/svelte-core/components/input';
  import { PasswordInput } from '@openshock/svelte-core/components/input';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { validatePasswordMatch } from '@openshock/svelte-core/inputvalidation/passwordValidator.js';
  import { toast } from 'svelte-sonner';
  import { FieldSeparator } from '@openshock/svelte-core/components/ui/field';
  import OauthButtons from '$lib/components/auth/oauth-buttons.svelte';
  import { ChevronLeft, Mail } from '@lucide/svelte';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { backendMetadata } from '$lib/state/backend-metadata-state.svelte';
  import { Skeleton } from '@openshock/svelte-core/components/ui/skeleton';

  registerBreadcrumbs(() => [{ label: 'Sign Up' }]);

  let username = $state<string>('');
  let usernameValid = $state<boolean>(false);

  let email = $state('');
  let emailValid = $state(false);

  let password = $state('');
  let passwordValid = $state(false);

  let passwordConfirm = $state('');

  let turnstileResponse = $state<string | null>(null);

  let canSubmit = $derived(
    usernameValid &&
      emailValid &&
      passwordValid &&
      password == passwordConfirm &&
      turnstileResponse != null
  );

  let accountCreated = $state(false);

  let useEmail = $state(false);

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

    if (!username || !email || !password || !passwordConfirm || turnstileResponse == null) {
      return;
    }

    try {
      await accountSignUpV2({
        body: { username, password, email, turnstileResponse },
      });
      accountCreated = true;
    } catch (error) {
      await handleApiError(error);
    }
  }

  let oauthProviders = $derived(backendMetadata.state?.oAuthProviders ?? []);
  let anyOAuthProviders = $derived(oauthProviders.length > 0);
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

<Card.Root>
  <Card.Header class="text-center">
    <Card.Title class="text-xl">Create your account</Card.Title>
    <Card.Description>
      {#if backendMetadata.state === null}
        Loading available sign-up methods
      {:else if useEmail}
        Signing up using email
      {:else}
        Choose your preferred sign-up method
      {/if}
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <Field.Group>
      {#if backendMetadata.state === null}
        <Skeleton class="h-9 w-full"></Skeleton>
        <Skeleton class="h-1 w-full"></Skeleton>
        <Skeleton class="h-9 w-full"></Skeleton>
      {:else if useEmail || !anyOAuthProviders}
        <form onsubmit={handleSubmission}>
          <div class="my-1 flex flex-col gap-1">
            {#if anyOAuthProviders}
              <Button
                variant="ghost"
                size="sm"
                class="text-muted-foreground hover:text-foreground -mx-2 -mt-2 mb-2 w-fit gap-1"
                onclick={() => (useEmail = false)}
              >
                <ChevronLeft class="size-4" />
                Back
              </Button>
            {/if}

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
            />
            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm Password"
              autocomplete="new-password"
              bind:value={passwordConfirm}
              validate={validatePasswordMatch(passwordConfirm, password)}
            />
            <Turnstile action="signup" onResponse={(response) => (turnstileResponse = response)} />
          </div>
          <Field.Field class="mt-5">
            <Button type="submit" disabled={!canSubmit}>Create Account</Button>
            <Field.Description class="text-center">
              Already have an account? <a href={resolve('/login')}>Sign in</a>
            </Field.Description>
          </Field.Field>
        </form>
      {:else}
        {#if anyOAuthProviders}
          <OauthButtons verb="Signup" providers={oauthProviders} />
          <FieldSeparator class="*:data-[slot=field-separator-content]:bg-card">Or</FieldSeparator>
        {/if}
        <Button variant="outline" class="w-full" onclick={() => (useEmail = true)}>
          <Mail />Signup with Email
        </Button>
      {/if}
    </Field.Group>
  </Card.Content>
</Card.Root>
<Field.Description class="px-6 text-center">
  By clicking Create Account, you agree to our <a href="https://openshock.org/tos"
    >Terms of Service</a
  >
  and <a href="https://openshock.org/privacy">Privacy Policy</a>.
</Field.Description>
