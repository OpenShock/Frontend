<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { authenticatedAccountChangeEmail } from '#lib/api/index.js';
  import KeyRound from '@lucide/svelte/icons/key-round';
  import Mail from '@lucide/svelte/icons/mail';
  import { EmailInput, PasswordInput } from '@openshock/svelte-core/components/input';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import type { ApiUserSelf } from '#lib/types/ApiUser.js';
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

      toast.success(m.account_email_toast_sent({ email }));

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
      <Dialog.Title>{m.account_email_title()}</Dialog.Title>
      <Dialog.Description>
        {m.account_email_desc()}
      </Dialog.Description>
    </Dialog.Header>

    <form class="space-y-2" onsubmit={submitEmail}>
      <EmailInput
        label={m.account_new_email()}
        placeholder={m.account_new_email()}
        autocomplete="off"
        bind:value={email}
        bind:valid={emailValid}
        Icon={Mail}
      />
      <PasswordInput
        label={m.account_current_password()}
        placeholder={m.account_current_password()}
        autocomplete="current-password"
        bind:value={currentPassword}
        Icon={KeyRound}
      />
      <Dialog.Footer>
        <Button type="button" variant="outline" onclick={() => (open = false)}
          >{m.common_cancel()}</Button
        >
        <Button
          type="submit"
          disabled={!emailValid ||
            email === account.email ||
            currentPassword.length === 0 ||
            loading}
        >
          {m.account_change_email()}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
