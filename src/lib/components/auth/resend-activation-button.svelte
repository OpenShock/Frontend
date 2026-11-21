<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
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
          toast.success(m.resend_toast_sent());
          break;
        case 'throttled':
          toast.info(m.resend_toast_throttled());
          break;
        case 'unavailable':
          toast.info(m.resend_toast_unavailable());
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
    {m.resend_button()}
  </Button>
{/if}
