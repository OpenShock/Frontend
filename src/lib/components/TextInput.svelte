<script lang="ts">
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();


  export let label: string;
  export let placeholder: string | undefined = undefined;
  export let autocomplete: string | undefined = undefined;
  export let value: string;
  export let validationResult: ValidationResult | null | undefined = undefined;

  export let icon: string | undefined = undefined;
  export let buttonText: string | undefined = undefined;
  export let buttonVariant: string | undefined = "variant-filled-primary";
  
  function handleButtonClick() {
    dispatch('buttonClick');
  }

  function handleInput(event: Event) {
    dispatch('input', event);
  }

</script>

<label class="label w-full">
  <span>{label}</span>
  <div class="flex flex-row items-center gap-2">
    <div class="input-group input-group-divider flex-grow grid-cols-[auto_1fr_auto]">
      {#if icon}
        <div class="input-group-shim fa {icon}"></div>
      {/if}
      <input type="text" title={label} {placeholder} {autocomplete} bind:value on:input={handleInput} />
      {#if buttonText}
          <button class={buttonVariant} on:click={handleButtonClick} disabled={validationResult !== undefined && !validationResult?.valid}>{buttonText}</button>
      {/if}
    </div>
  </div>
  {#if !validationResult || validationResult.valid}
    <div class="h-3"></div>
  {:else}
    <p class="text-xs text-red-500 !mt-0">{validationResult.message}</p>
  {/if}
</label>
