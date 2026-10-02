<script lang="ts">
  import { Check, Search } from '@lucide/svelte';
  import { ResponseError, usersGetByName } from '#lib/api/index.js';
  import type { BasicUserInfo } from '#lib/api/index.js';
  import * as Avatar from '@openshock/svelte-core/components/ui/avatar';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import { Input } from '@openshock/svelte-core/components/ui/input';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';

  interface Props {
    fetchedUser: BasicUserInfo | null;
  }

  let userInput = $state('');
  let { fetchedUser = $bindable(null) }: Props = $props();

  function check() {
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

  // Not a <form>: this sits inside the share dialog's form, and nested forms are invalid HTML.
  // Enter runs the lookup while the name is unconfirmed, and otherwise falls through to the outer form.
  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter' || !inputModified) return;
    event.preventDefault();
    check();
  }
</script>

<div class="flex items-center gap-2">
  <Avatar.Root class={(fetchedUser ? 'border-success border-3' : '') + ' h-15 w-15'}>
    <Avatar.Image
      src={fetchedUser?.image}
      alt={fetchedUser ? `${fetchedUser.name}'s avatar` : 'User avatar'}
    />
    <Avatar.Fallback>?</Avatar.Fallback>
  </Avatar.Root>
  <Input
    bind:value={userInput}
    onkeydown={onKeydown}
    placeholder="Enter user name"
    aria-label="Username to search"
  />
  <Button
    onclick={check}
    disabled={!inputModified}
    type="button"
    title={inputModified ? 'Search user' : 'User found'}
  >
    {#if inputModified}
      <Search />
    {:else}
      <Check />
    {/if}
  </Button>
</div>
