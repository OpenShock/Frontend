<script lang="ts">
  import { goto } from '$app/navigation';
  import { accountV1Api } from '$lib/api';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import Turnstile from '$lib/components/Turnstile.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';

  let emailAddress = $state<string>('');
  let turnstileResponse = $state<string | null>(null);

  function handleSubmission(e: SubmitEvent) {
    e.preventDefault();

    if (!emailAddress || !turnstileResponse) {
      return;
    }

    accountV1Api
      .accountPasswordResetInitiate({ email: emailAddress })
      .then(() => {
        goto('/login');
      })
      .catch(handleApiError);
  }

  let canSubmit = $derived(emailAddress.length > 0 && turnstileResponse != null);
</script>

<div class="container my-8">
  <Card.Header>
    <Card.Title class="text-3xl">Forgot Password</Card.Title>
  </Card.Header>
  <Card.Content>
    <form class="flex flex-col space-y-4" onsubmit={handleSubmission}>
      <TextInput label="Email" placeholder="Email" autocomplete="on" bind:value={emailAddress} />

      <Turnstile action="forgot-password" bind:response={turnstileResponse} />

      <Button type="submit" disabled={!canSubmit}>I forgot my passord</Button>
    </form>
  </Card.Content>
</div>
