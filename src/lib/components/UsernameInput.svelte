<script lang="ts">
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import { createEventDispatcher } from "svelte";
  import { validateUsername } from '$lib/inputvalidation/usernameValidator';
  import { ResponseError, UsernameAvailability, type UsernameCheckResponse } from '$lib/api/internal/v1';
  import { accountApi, authenticatedAccountApi } from '$lib/api';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { getToastStore } from '@skeletonlabs/skeleton';

  const dispatch = createEventDispatcher();
  const toastStore = getToastStore();

  export let placeholder: string | undefined = undefined;
  export let username: string;
  export let buttonText: string | undefined = undefined;

  let usernameValres: ValidationResult | null;

  let pendingUsernameCheck: boolean = false;
  let usernameCheck: UsernameCheckResponse | null = null;

  $: allGood = usernameValres?.valid && !pendingUsernameCheck && usernameCheck && usernameCheck.availability === UsernameAvailability.available;

	let timer: NodeJS.Timeout;
  
  function handleButtonClick() {
    dispatch('buttonClick');
  }

  function handleInput() {
    usernameValres = validateUsername(username);

    usernameCheck = null;
		clearTimeout(timer);

    if(!usernameValres || !usernameValres.valid) {
      pendingUsernameCheck = false;
      return;
    }

    pendingUsernameCheck = true;

		timer = setTimeout(async () => {
			usernameCheck = await checkUsernameAvailability();
      console.log(usernameCheck);
		}, 500);
  }

  async function checkUsernameAvailability(): Promise<UsernameCheckResponse> {
    try {
      const response = await accountApi.accountCheckUsername({ username: username });
      pendingUsernameCheck = false;
      return response;
    } catch (e) {
      await handleApiError(e, toastStore);
      pendingUsernameCheck = false;
      throw e;
    }
  }

</script>

<label class="label w-full">
  <span>Username</span>
  <div class="flex flex-row items-center gap-2">
    <div class="input-group input-group-divider flex-grow grid-cols-[auto_1fr_auto]">
        <div class="input-group-shim fa fa-user"></div>
      <input type="text" title="Username" {placeholder} autocomplete="off" bind:value={username} on:input={handleInput} />
      {#if buttonText}
          <button class="variant-filled-primary" on:click={handleButtonClick} disabled={!allGood}>{buttonText}</button>
      {/if}
    </div>
  </div>
  {#if !usernameValres || usernameValres.valid}
    {#if pendingUsernameCheck}
      <p class="text-xs text-gray-500 !mt-0">Checking username availability...</p>
    {:else if usernameCheck}
      {#if usernameCheck.availability === UsernameAvailability.available}
      <p class="text-xs text-green-500 !mt-0">Username is available ✅</p>
      {:else if usernameCheck.availability === UsernameAvailability.taken}
      <p class="text-xs text-red-500 !mt-0">Username is already taken</p>
      {:else}
      <p class="text-xs text-red-500 !mt-0">Unknown username is invalid: {usernameCheck.error?.message}</p>
      {/if}
    {:else}
    <div class="h-3"></div>
    {/if}
  {:else}
    <p class="text-xs text-red-500 !mt-0">{usernameValres.message}</p>
  {/if}
</label>
