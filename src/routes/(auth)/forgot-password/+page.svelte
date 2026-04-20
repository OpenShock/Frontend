<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { accountV1Api } from '$lib/api';
  import Turnstile from '$lib/components/Turnstile.svelte';
  import EmailInput from '$lib/components/input/EmailInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Field, FieldDescription } from '$lib/components/ui/field/index.js';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { toast } from 'svelte-sonner';

  registerBreadcrumbs(() => [{ label: 'Forgot Password' }]);

  let email = $state<string>('');
  let emailValid = $state(false);

  let turnstileResponse = $state<string | null>(null);

  function handleSubmission(e: SubmitEvent) {
    e.preventDefault();

    if (!email || !turnstileResponse) {
      return;
    }

    accountV1Api
      .accountPasswordResetInitiate({ email })
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
  </Card.Content>
</Card.Root>
