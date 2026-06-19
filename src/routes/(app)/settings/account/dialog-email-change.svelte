<script lang="ts">
  import { authenticatedAccountChangeEmail } from '$lib/api';
  import KeyRound from '@lucide/svelte/icons/key-round';
  import Mail from '@lucide/svelte/icons/mail';
  import EmailInput from '$lib/components/input/EmailInput.svelte';
  import PasswordInput from '$lib/components/input/PasswordInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import type { ApiUserSelf } from '$lib/types/ApiUser';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    account: ApiUserSelf;
  }

  let { open = $bindable(false), account }: Props = $props();

  let loading = $state(false);

  let email = $state<string>('');
  let emailValid = $state(false);
  let currentPassword = $state<string>('');

  $effect(() => {
    if (open) {
      email = '';
      emailValid = false;
      currentPassword = '';
    }
  });

  async function submitEmail(e: Event) {
    e.preventDefault();
    if (loading) return;
    loading = true;

    try {
      await authenticatedAccountChangeEmail({ body: { email, currentPassword } });

      toast.success(
        `Verification email sent to ${email}. Click the link in that email to apply the change.`
      );

      open = false;
    } catch (e) {
      await handleApiError(e);
    } finally {
      loading = false;
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Change Email</Dialog.Title>
      <Dialog.Description>
        Enter your new email address and confirm with your current password.
      </Dialog.Description>
    </Dialog.Header>

    <form class="space-y-2" onsubmit={submitEmail}>
      <EmailInput
        label="New Email"
        placeholder="New Email"
        autocomplete="off"
        bind:value={email}
        bind:valid={emailValid}
        Icon={Mail}
      />
      <PasswordInput
        label="Current Password"
        placeholder="Current Password"
        autocomplete="current-password"
        bind:value={currentPassword}
        Icon={KeyRound}
      />
      <Button
        type="submit"
        disabled={!emailValid || email === account.email || currentPassword.length === 0 || loading}
      >
        Change Email
      </Button>
    </form>
  </Dialog.Content>
</Dialog.Root>
