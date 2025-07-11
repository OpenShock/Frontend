<script lang="ts">
  import User from '@lucide/svelte/icons/user';
  import { accountV1Api } from '$lib/api';
  import UsernameInput from '$lib/components/input/UsernameInput.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { UserStore } from '$lib/stores/UserStore';
  import type { ApiUserSelf } from '$lib/types/ApiUser';
  import { toast } from 'svelte-sonner';

  interface Props {
    account: ApiUserSelf;
  }

  let { account }: Props = $props();

  let username = $state<string>('');

  async function submitUsername() {
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
    }
  }
</script>

<UsernameInput
  label="Username"
  placeholder={account.name}
  autocomplete="off"
  bind:value={username}
  Icon={User}
  button={{ text: 'Change', submits: true, onClick: submitUsername }}
/>
