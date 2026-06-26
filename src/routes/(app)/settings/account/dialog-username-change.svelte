<script lang="ts">
  import { authenticatedAccountChangeUsername } from '$lib/api';
  import User from '@lucide/svelte/icons/user';
  import UsernameInput from '$lib/components/input/UsernameInput.svelte';
  import { Button } from '@openshock/svelte-core/ui/button';
  import * as Dialog from '@openshock/svelte-core/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { userState } from '$lib/state/user-state.svelte';
  import type { ApiUserSelf } from '$lib/types/ApiUser';
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

      toast.success('Username changed successfully');

      userState.setSelfName(username);

      open = false;
    } catch (e) {
      await handleApiError(e, (problem) => {
        if (problem.type !== 'Account.Username.Invalid') return false;

        toast.error('Invalid Username');

        return true;
      });
    } finally {
      loading = false;
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Change Username</Dialog.Title>
      <Dialog.Description>Enter a new username.</Dialog.Description>
    </Dialog.Header>

    <form class="space-y-2" onsubmit={submitUsername}>
      <UsernameInput
        label="New Username"
        placeholder="New Username"
        autocomplete="off"
        bind:value={username}
        bind:valid={usernameValid}
        Icon={User}
      />
      <Button type="submit" disabled={!usernameValid || username === account.name || loading}>
        Change Username
      </Button>
    </form>
  </Dialog.Content>
</Dialog.Root>
