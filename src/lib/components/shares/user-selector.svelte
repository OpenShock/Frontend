<script lang="ts">
  import { Check, Search } from '@lucide/svelte';
  import { ResponseError, usersGetByName } from '$lib/api';
  import type { BasicUserInfo } from '$lib/api';
  import * as Avatar from '$hadcn/avatar';
  import { Button } from '$hadcn/button';
  import { Input } from '$hadcn/input';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';

  interface Props {
    fetchedUser: BasicUserInfo | null;
  }

  let userInput = $state('');
  let { fetchedUser = $bindable(null) }: Props = $props();

  function check(event: Event) {
    event.preventDefault();
    usersGetByName({ path: { username: userInput } })
      .then((user) => {
        fetchedUser = user;
        userInput = user.name;
      })
      .catch((error) => {
        fetchedUser = null;
        // A 404 just means no user by that name — expected, no toast.
        // Surface anything else (network/server errors) to the user.
        if (!(error instanceof ResponseError && error.response.status === 404)) {
          handleApiError(error);
        }
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
