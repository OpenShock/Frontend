<script lang="ts">
  import { ResendActivationEmail, hasActivationResendCookie } from '#lib/api/next/account.js';
  import { onMount } from 'svelte';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import { toast } from 'svelte-sonner';

  let { class: className }: { class?: string } = $props();

  let pending = $state(false);

  // Only offered while this browser holds the resend cookie (set on signup, cleared on login/activation).
  let available = $state(false);
  onMount(() => (available = hasActivationResendCookie()));

  async function resend() {
    pending = true;
    try {
      switch (await ResendActivationEmail()) {
        case 'sent':
          toast.success('Activation email sent. Check your inbox and spam folder.');
          break;
        case 'throttled':
          toast.info(
            'An activation email was sent recently. Please wait a few minutes and try again.'
          );
          break;
        case 'unavailable':
          toast.info(
            'There is no pending activation to resend. Try logging in to get a new activation email.'
          );
          break;
      }
    } catch (error) {
      await handleApiError(error);
    } finally {
      pending = false;
      // The API deletes the cookie once there is nothing left to resend.
      available = hasActivationResendCookie();
    }
  }
</script>

{#if available}
  <Button variant="link" size="sm" class={className} disabled={pending} onclick={resend}>
    Didn't get the email? Resend
  </Button>
{/if}
