<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { authenticatedAccountChangeUsername } from '#lib/api/index.js';
  import User from '@lucide/svelte/icons/user';
  import UsernameInput from '#lib/components/input/UsernameInput.svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { userState } from '#lib/state/user-state.svelte.js';
  import type { ApiUserSelf } from '#lib/types/ApiUser.js';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    account: ApiUserSelf;
  }

  let { open = $bindable(false), account }: Props = $props();

  let loading = $state(false);

  let username = $state<string>('');
  let usernameValid = $state(false);

  $effect(() => {
    if (open) {
      username = '';
      usernameValid = false;
    }
  });

  async function submitUsername(e: Event) {
    e.preventDefault();
    if (loading) return;
    loading = true;

    try {
      await authenticatedAccountChangeUsername({ body: { username } });

      toast.success(m.account_username_toast());

      userState.setSelfName(username);

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
      <Dialog.Title>{m.account_username_title()}</Dialog.Title>
      <Dialog.Description>{m.account_username_desc()}</Dialog.Description>
    </Dialog.Header>

    <form class="space-y-2" onsubmit={submitUsername}>
      <UsernameInput
        label={m.account_new_username()}
        placeholder={m.account_new_username()}
        autocomplete="off"
        bind:value={username}
        bind:valid={usernameValid}
        Icon={User}
      />
      <Dialog.Footer>
        <Button type="button" variant="outline" onclick={() => (open = false)}
          >{m.common_cancel()}</Button
        >
        <Button type="submit" disabled={!usernameValid || username === account.name || loading}>
          {m.account_change_username()}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
