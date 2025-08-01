<script lang="ts">
  import TextInput from '$lib/components/input/TextInput.svelte';
  import { validateEmail } from '$lib/inputvalidation/emailValidator';
  import type { AnyComponent } from '$lib/types/AnyComponent';
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import type { Snippet } from 'svelte';
  import type { FullAutoFill } from 'svelte/elements';

  interface Props {
    label?: string;
    placeholder?: string;
    autocomplete?: FullAutoFill;
    value: string;
    valid?: boolean;
    validate?: boolean;
    Icon?: AnyComponent;
    after?: Snippet;
  }

  let {
    label,
    placeholder,
    autocomplete = 'email',
    value = $bindable(),
    valid = $bindable(false),
    validate = true,
    Icon,
    after,
  }: Props = $props();

  let validationResult = $derived<ValidationResult | null>(
    validate ? validateEmail(value) : { valid: true }
  );

  $effect(() => {
    valid = validationResult?.valid ?? false;
  });
</script>

<TextInput {label} {placeholder} {autocomplete} bind:value {validationResult} {Icon} {after} />
