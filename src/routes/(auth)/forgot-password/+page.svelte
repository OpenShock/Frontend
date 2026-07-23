<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { accountPasswordResetInitiateV2 } from '$lib/api';
  import Turnstile from '$lib/components/Turnstile.svelte';
  import { EmailInput } from '@openshock/svelte-core/components/input';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { Field, FieldDescription } from '@openshock/svelte-core/components/ui/field';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { backendMetadata } from '$lib/state/backend-metadata-state.svelte';
  import { toast } from 'svelte-sonner';

  registerBreadcrumbs(() => [{ label: 'Forgot Password' }]);

  // Without a mail provider the reset link can never be delivered, so the flow is unavailable.
  let mailEnabled = $derived(backendMetadata.state?.isMailEnabled ?? true);

  let email = $state<string>('');
  let emailValid = $state(false);

  let turnstileResponse = $state<string | null>(null);

  function handleSubmission(e: SubmitEvent) {
    e.preventDefault();

    if (!email || !turnstileResponse) {
      return;
    }

    accountPasswordResetInitiateV2({ body: { email, turnstileResponse } })
      .then(() => {
        toast.success('Reset password request has been sent to the given email');
        goto(resolve('/login'));
      })
      .catch(handleApiError);
  }

  let canSubmit = $derived(emailValid && turnstileResponse != null);
</script>

<Card.Root>
  <Card.Header class="text-center">
    <Card.Title class="text-xl">Forgot Password</Card.Title>
    <Card.Description>Enter your email to reset your password</Card.Description>
  </Card.Header>
  <Card.Content>
    {#if mailEnabled}
      <form class="flex flex-col gap-4" onsubmit={handleSubmission}>
        <EmailInput
          label="Email"
          placeholder="Email"
          autocomplete="off"
          bind:value={email}
          bind:valid={emailValid}
        />

        <Turnstile
          action="forgot-password"
          onResponse={(response) => (turnstileResponse = response)}
        />

        <Field class="mt-1">
          <Button type="submit" disabled={!canSubmit}>Reset Password</Button>
          <FieldDescription class="text-center">
            Remember your password? <a href={resolve('/login')}>Sign in</a>
          </FieldDescription>
        </Field>
      </form>
    {:else}
      <div class="flex flex-col gap-4">
        <p class="text-muted-foreground text-center text-sm">
          Password resets are unavailable on this instance because it has no mail provider
          configured. Please contact your administrator for help recovering your account.
        </p>
        <Field class="mt-1">
          <FieldDescription class="text-center">
            Remember your password? <a href={resolve('/login')}>Sign in</a>
          </FieldDescription>
        </Field>
      </div>
    {/if}
  </Card.Content>
</Card.Root>
