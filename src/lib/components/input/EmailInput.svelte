<script lang="ts">
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import { validateEmail } from '$lib/inputvalidation/emailValidator';
  import type { FullAutoFill } from 'svelte/elements';
  import type { ButtonSettings } from '$lib/components/input/impl/ButtonSettings';


  interface Props {
    label: string;
    placeholder?: string;
    autocomplete?: FullAutoFill;
    value: string;
    valid?: boolean;
    validate?: boolean;
    icon?: `fa-${string}`;
    button?: ButtonSettings;
  }

  let {
    label,
    placeholder,
    autocomplete = 'email',
    value = $bindable(),
    valid = $bindable(false),
    validate = true,
    icon,
    button
  }: Props = $props();

  let validationResult: ValidationResult | null = $state(null);
  $effect(() => {
    if (validate) {
      validationResult = validateEmail(value);
      
      valid = validationResult?.valid ?? false;
    } else {
      validationResult = { valid: true };

      valid = true;
    }
  });
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
