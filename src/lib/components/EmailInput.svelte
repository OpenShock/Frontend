<script lang="ts">
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import TextInput from '$lib/components/TextInput.svelte';
  import { validateEmail } from '$lib/inputvalidation/emailValidator';

  export let label: string = 'Email';
  export let placeholder: string | undefined = 'Email';
  export let autocomplete: string | undefined = 'email';
  export let value: string;
  export let valid: boolean = false;
  export let validate: boolean = true;

  export let icon: string | undefined = undefined;
  export let button: { text: string; variant?: string; onClick: () => void } | undefined =
    undefined;

  let validationResult: ValidationResult | null = null;

  $: if (validate) {
    validationResult = validateEmail(value);
  } else {
    validationResult = { valid: true };
  }

  $: valid = validationResult?.valid ?? false;
</script>

<TextInput {label} {placeholder} {autocomplete} bind:value {validationResult} {icon} {button} />
