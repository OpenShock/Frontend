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
  let { fetchedUser = $bindable(null) }: Props = $props();

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

  let inputModified = $derived(fetchedUser?.name !== userInput);
</script>

<form class="flex items-center gap-2" onsubmit={check}>
  <Avatar.Root class={(fetchedUser ? 'border-3 border-green-500' : '') + ' h-15 w-15'}>
    <Avatar.Image
      src={fetchedUser?.image}
      alt={fetchedUser ? `${fetchedUser.name}'s avatar` : 'User avatar'}
    />
    <Avatar.Fallback>?</Avatar.Fallback>
  </Avatar.Root>
  <Input bind:value={userInput} placeholder="Enter user name" aria-label="Username to search" />
  <Button
    onclick={check}
    disabled={!inputModified}
    type="submit"
    title={inputModified ? 'Search user' : 'User found'}
  >
    {#if inputModified}
      <Search />
    {:else}
      <Check />
    {/if}
  </Button>
</form>
