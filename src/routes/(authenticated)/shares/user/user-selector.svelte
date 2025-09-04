<script lang="ts">
  import { Check, Search } from '@lucide/svelte';
  import { usersApi } from '$lib/api';
  import type { BasicUserInfo } from '$lib/api/internal/v1';
  import * as Avatar from '$lib/components/ui/avatar';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input/index.js';

  interface Props {
    fetchedUser: BasicUserInfo | null;
  }

  let userInput = $state('');
  let { fetchedUser = $bindable(null) } = $props();

  function check(event: Event) {
    event.preventDefault();
    usersApi
      .usersGetByName(userInput)
      .then((user) => {
        fetchedUser = user;
        userInput = user.name;
      })
      .catch(() => {
        fetchedUser = null;
      });
  }

  let inputModified = $derived(() => {
    if (fetchedUser) {
      return userInput !== fetchedUser.name;
    }
    return true;
  });
</script>

<form class="flex gap-2 items-center" onsubmit={check}>
  <Avatar.Root class={(fetchedUser ? 'border-3 border-green-500' : '') + ' h-15 w-15'}>
    <Avatar.Image src={fetchedUser?.image} alt="User Avatar" />
    <Avatar.Fallback>?</Avatar.Fallback>
  </Avatar.Root>
  <Input bind:value={userInput} />
  <Button onclick={check} disabled={!inputModified()} type="submit">
    {#if inputModified()}
      <Search />
    {:else}
      <Check />
    {/if}
  </Button>
</form>
