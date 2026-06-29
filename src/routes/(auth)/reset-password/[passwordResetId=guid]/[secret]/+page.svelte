<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import KeyRound from '@lucide/svelte/icons/key-round';
  import { accountPasswordResetCheckValid, accountPasswordResetComplete } from '$lib/api';
  import { PasswordInput } from '@openshock/svelte-core/components/input/index.js';
  import { Button } from '@openshock/svelte-core/components/ui/button/index.js';
  import * as Card from '@openshock/svelte-core/components/ui/card/index.js';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { validatePasswordMatch } from '@openshock/svelte-core/inputvalidation/passwordValidator.js';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { toast } from 'svelte-sonner';

  registerBreadcrumbs(() => [{ label: 'Reset Password' }]);

  let passwordResetId = $derived(page.params.passwordResetId!);
  let secret = $derived(page.params.secret!);

  let checking = $state(true);
  let valid = $state(false);
  let loading = $state(false);

  let password = $state<string>('');
  let passwordValid = $state<boolean>(false);

  let passwordConfirm = $state<string>('');
  let passwordConfirmValid = $derived(validatePasswordMatch(passwordConfirm, password));

  $effect(() => {
    checking = true;
    accountPasswordResetCheckValid({ path: { passwordResetId, secret } })
      .then(() => {
        valid = true;
      })
      .catch(async (e: unknown) => {
        valid = false;
        await handleApiError(e);
      })
      .finally(() => {
        checking = false;
      });
  });

  async function submitReset(e: SubmitEvent) {
    e.preventDefault();
    if (loading) return;
    loading = true;

    try {
      await accountPasswordResetComplete({
        path: { passwordResetId, secret },
        body: { password },
      });

      toast.success('Password has been reset');
      goto(resolve('/login'));
    } catch (e) {
      await handleApiError(e);
    } finally {
      loading = false;
    }
  }

  let canSubmit = $derived(
    valid && passwordValid && (passwordConfirmValid?.valid ?? false) && !loading
  );
</script>

<Card.Root>
  <Card.Header class="text-center">
    <Card.Title class="text-xl">Reset Password</Card.Title>
    <Card.Description>
      {#if checking}
        Verifying reset link...
      {:else if valid}
        Choose a new password for your account
      {:else}
        This reset link is invalid or has expired
      {/if}
    </Card.Description>
  </Card.Header>
  <Card.Content>
    {#if valid}
      <form class="flex flex-col gap-4" onsubmit={submitReset}>
        <PasswordInput
          label="New Password"
          placeholder="New Password"
          autocomplete="new-password"
          bind:value={password}
          bind:valid={passwordValid}
          Icon={KeyRound}
          validate
          showStrengthMeter
        />

        <PasswordInput
          label="Confirm New Password"
          placeholder="Confirm New Password"
          autocomplete="new-password"
          bind:value={passwordConfirm}
          Icon={KeyRound}
          validate={passwordConfirmValid}
        />

        <Button type="submit" disabled={!canSubmit}>Reset Password</Button>
      </form>
    {:else if !checking}
      <Button class="w-full" onclick={() => goto(resolve('/forgot-password'))}>
        Request a new reset link
      </Button>
    {/if}
  </Card.Content>
</Card.Root>
