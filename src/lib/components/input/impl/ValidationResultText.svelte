<script lang="ts">
  import { GetValResColor, type ValidationResult } from '$lib/types/ValidationResult';
  export let validationResult: ValidationResult | null | undefined = undefined;
</script>

{#if !validationResult || !('message' in validationResult)}
  <div class="h-3"></div>
{:else}
  <p class="text-xs text-{GetValResColor(validationResult)} !mt-0">{validationResult.message}</p>
{/if}
