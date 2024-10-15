<script lang="ts">
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import ValidationResultText from './impl/ValidationResultText.svelte';

  export let type: 'text' | 'password' = 'text';
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
    <div
      class={'input-group input-group-divider flex-grow grid-cols-[auto_1fr' +
        (button ? '_auto' : '') +
        ']'}
    >
      {#if icon}
        <div class="input-group-shim fa {icon}"></div>
      {/if}
      {#if type === 'password'}
        <input type="password" title={label} {placeholder} {autocomplete} bind:value on:input />
      {:else}
        <input type="text" title={label} {placeholder} {autocomplete} bind:value on:input />
      {/if}
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
  <ValidationResultText {validationResult} />
</label>
