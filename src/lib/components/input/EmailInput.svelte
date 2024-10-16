<script lang="ts">
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import { validateEmail } from '$lib/inputvalidation/emailValidator';
  import type { ButtonSettings } from '$lib/components/input/impl/ButtonSettings';

  export let label: string;
  export let placeholder: string | undefined = undefined;
  export let autocomplete: string | undefined = 'email';
  export let value: string;
  export let valid: boolean = false;
  export let validate: boolean = true;

  export let icon: `fa-${string}` | undefined = undefined;
  export let button: ButtonSettings | undefined = undefined;

  let validationResult: ValidationResult | null = null;

  $: if (validate) {
    validationResult = validateEmail(value);
  } else {
    validationResult = { valid: true };
  }

  $: valid = validationResult?.valid ?? false;
</script>

<TextInput
  {label}
  {placeholder}
  {autocomplete}
  bind:value
  {validationResult}
  {icon}
  {button}
  on:input
/>
