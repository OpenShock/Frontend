<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { authenticatedAccountChangePassword } from '#lib/api/index.js';
  import KeyRound from '@lucide/svelte/icons/key-round';
  import { PasswordInput } from '@openshock/svelte-core/components/input';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { validatePasswordMatch } from '@openshock/svelte-core/inputvalidation';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  let loading = $state<boolean>(false);

  let currentPassword = $state<string>('');
  let currentPasswordValid = $derived(currentPassword.length > 0);

  let password = $state<string>('');
  let passwordValid = $state<boolean>(false);

  let passwordConfirm = $state<string>('');
  let passwordConfirmValid = $derived(validatePasswordMatch(passwordConfirm, password));

  $effect(() => {
    if (open) {
      currentPassword = '';
      password = '';
      passwordConfirm = '';
      passwordValid = false;
    }
  });

  async function submitPassword(e: SubmitEvent) {
    e.preventDefault();
    loading = true;

    try {
      await authenticatedAccountChangePassword({
        body: { currentPassword, newPassword: password },
      });

      toast.success(m.account_password_toast());

      open = false;
    } catch (e) {
      await handleApiError(e);
    } finally {
      loading = false;
    }
  }

  let canSubmitPassword = $derived(
    currentPasswordValid && passwordValid && (passwordConfirmValid?.valid ?? false) && !loading
  );
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{m.account_password_title()}</Dialog.Title>
      <Dialog.Description>{m.account_password_desc()}</Dialog.Description>
    </Dialog.Header>

    <form class="space-y-2" onsubmit={submitPassword}>
      <PasswordInput
        label={m.account_current_password()}
        placeholder={m.account_current_password()}
        autocomplete="current-password"
        bind:value={currentPassword}
        Icon={KeyRound}
      />

      <PasswordInput
        label={m.auth_reset_password_label()}
        placeholder={m.auth_reset_password_label()}
        autocomplete="new-password"
        bind:value={password}
        bind:valid={passwordValid}
        Icon={KeyRound}
        validate
        showStrengthMeter
      />

      <PasswordInput
        label={m.auth_reset_confirm_label()}
        placeholder={m.auth_reset_confirm_label()}
        autocomplete="new-password"
        bind:value={passwordConfirm}
        Icon={KeyRound}
        validate={passwordConfirmValid}
      />

      <Dialog.Footer>
        <Button type="button" variant="outline" onclick={() => (open = false)}
          >{m.common_cancel()}</Button
        >
        <Button type="submit" disabled={!canSubmitPassword}>{m.account_change_password()}</Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
