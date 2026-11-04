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
          toast.info('Too many activation emails have been requested. Please try again later.');
          break;
        case 'unavailable':
          toast.info(
            "No activation email can be resent from this browser. If your account isn't activated yet, logging in sends a new link."
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
