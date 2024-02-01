<script lang="ts">
  import type { ValidationResult } from '$lib/types/ValidationResult';

  export let label: string;
  export let placeholder: string | undefined = undefined;
  export let autocomplete: string | undefined = undefined;
  export let value: string;
  export let validationResult: ValidationResult | null | undefined = undefined;
</script>

<label class="label w-full">
  <span>{label}</span>
  <div class="flex flex-row items-center gap-2">
    <div class="input-group input-group-divider flex-grow grid-cols-[1fr_auto]">
      <input class="input" type="text" title={label} {placeholder} {autocomplete} bind:value />
    </div>
    <slot name="button" />
  </div>
  {#if validationResult}
    <p class="text-sm text-red-500">{validationResult.message}</p>
  {/if}
</label>
