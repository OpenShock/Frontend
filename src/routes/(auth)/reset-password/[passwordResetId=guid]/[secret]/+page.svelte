<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import KeyRound from '@lucide/svelte/icons/key-round';
  import { accountPasswordResetCheckValid, accountPasswordResetComplete } from '#lib/api/index.js';
  import { PasswordInput } from '@openshock/svelte-core/components/input';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { validatePasswordMatch } from '@openshock/svelte-core/inputvalidation';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { toast } from 'svelte-sonner';
  import { m } from '#lib/paraglide/messages.js';

  registerBreadcrumbs(() => [{ label: m.auth_reset_breadcrumb() }]);

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

      toast.success(m.auth_reset_toast_success());
      goto(resolve('login'));
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
    <Card.Title class="text-xl"><h1>{m.auth_reset_title()}</h1></Card.Title>
    <Card.Description>
      {#if checking}
        {m.auth_reset_checking()}
      {:else if valid}
        {m.auth_reset_choose_password()}
      {:else}
        {m.auth_reset_invalid()}
      {/if}
    </Card.Description>
  </Card.Header>
  <Card.Content>
    {#if valid}
      <form class="flex flex-col gap-4" onsubmit={submitReset}>
        <PasswordInput
          label={m.auth_reset_password_label()}
          placeholder={m.auth_reset_password_placeholder()}
          autocomplete="new-password"
          bind:value={password}
          bind:valid={passwordValid}
          Icon={KeyRound}
          validate
          showStrengthMeter
        />

        <PasswordInput
          label={m.auth_reset_confirm_label()}
          placeholder={m.auth_reset_confirm_placeholder()}
          autocomplete="new-password"
          bind:value={passwordConfirm}
          Icon={KeyRound}
          validate={passwordConfirmValid}
        />

        <Button type="submit" disabled={!canSubmit}>{m.auth_reset_submit()}</Button>
      </form>
    {:else if !checking}
      <Button class="w-full" onclick={() => goto(resolve('forgot-password'))}
        >{m.auth_reset_request_new()}</Button
      >
    {/if}
  </Card.Content>
</Card.Root>
