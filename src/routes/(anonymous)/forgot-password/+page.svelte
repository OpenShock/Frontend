<script lang="ts">
  import { goto } from '$app/navigation';
  import { accountV1Api } from '$lib/api';
  import Container from '$lib/components/Container.svelte';
  import Turnstile from '$lib/components/Turnstile.svelte';
  import EmailInput from '$lib/components/input/EmailInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';

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
        goto('/login');
      })
      .catch(handleApiError);
  }

  let canSubmit = $derived(emailValid && turnstileResponse != null);
</script>

<Container class="items-center">
  <form class="flex flex-col space-y-4" onsubmit={handleSubmission}>
    <div class="text-3xl font-semibold">Forgot Password</div>

    <EmailInput
      label="Email"
      placeholder="Email"
      autocomplete="on"
      bind:value={email}
      bind:valid={emailValid}
    />

    <Turnstile action="forgot-password" bind:response={turnstileResponse} />

    <Button type="submit" disabled={!canSubmit}>I forgot my passord</Button>
  </form>
</Container>
