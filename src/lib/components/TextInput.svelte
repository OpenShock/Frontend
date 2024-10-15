<script lang="ts">
  import type { ValidationResult } from '$lib/types/ValidationResult';

  export let label: string;
  export let placeholder: string | undefined = undefined;
  export let autocomplete: string | undefined = undefined;
  export let value: string;
  export let validationResult: ValidationResult | null | undefined = undefined;

  export let icon: string | undefined = undefined;
  export let button: { text: string; variant?: string; onClick: () => void } | undefined =
    undefined;
</script>

<label class="label w-full">
  <span>{label}</span>
  <div class="flex flex-row items-center gap-2">
    <div class="input-group input-group-divider flex-grow grid-cols-[auto_1fr_auto]">
      {#if icon}
        <div class="input-group-shim fa {icon}"></div>
      {/if}
      <input type="text" title={label} {placeholder} {autocomplete} bind:value />
      {#if button}
        <button
          class={button.variant ?? 'variant-filled-primary'}
          on:click={button.onClick}
          disabled={validationResult && !validationResult.valid}
        >
          {button.text}
        </button>
      {/if}
    </div>
  </div>
  {#if !validationResult || validationResult.valid}
    <div class="h-3"></div>
  {:else}
    <p class="text-xs text-red-500 !mt-0">{validationResult.message}</p>
  {/if}
</label>
