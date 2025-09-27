<script lang="ts">
  import User from '@lucide/svelte/icons/user';
  import { accountV1Api } from '$lib/api';
  import UsernameInput from '$lib/components/input/UsernameInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { UserStore } from '$lib/stores/UserStore';
  import type { ApiUserSelf } from '$lib/types/ApiUser';
  import { toast } from 'svelte-sonner';

  interface Props {
    account: ApiUserSelf;
  }

  let { account }: Props = $props();

  let loading = $state(false);

  let username = $state<string>('');
  let usernameValid = $state(false);

  async function submitUsername(e: Event) {
    e.preventDefault();
    if (loading) return;
    loading = true;

    try {
      await accountV1Api.authenticatedAccountChangeUsername({ username });

      toast.success('Username changed successfully');

      UserStore.setSelfName(username);

      username = '';
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

<UsernameInput
  label="Username"
  placeholder={account.name}
  autocomplete="off"
  bind:value={username}
  bind:valid={usernameValid}
  Icon={User}
>
  {#snippet after()}
    <Button
      type="button"
      onclick={submitUsername}
      disabled={!usernameValid || username === account.email || loading}
    >
      Change
    </Button>
  {/snippet}
</UsernameInput>
