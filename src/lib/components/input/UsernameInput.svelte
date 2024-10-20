<script lang="ts">
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import {
    mapUsernameAvailability,
    UsernameCheckingAvailabilityValRes,
    UsernameInternalServerErrorValRes,
    validateUsername,
  } from '$lib/inputvalidation/usernameValidator';
  import { accountApi } from '$lib/api';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { getToastStore } from '@skeletonlabs/skeleton';
  import type { FullAutoFill } from 'svelte/elements';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import type { ButtonSettings } from '$lib/components/input/impl/ButtonSettings';

  const toastStore = getToastStore();

  interface Props {
    label: string;
    placeholder?: string;
    autocomplete?: FullAutoFill;
    value: string;
    valid?: boolean;
    validate?: boolean;
    icon?: `fa-${string}`;
    button?: ButtonSettings;
    oninput?: (value: string) => void | undefined;
  }

  let {
    label,
    placeholder,
    autocomplete = 'username',
    value = $bindable(),
    valid = $bindable(false),
    validate = true,
    icon,
    button,
    oninput,
  }: Props = $props();

  let validationResult: ValidationResult | null = $state(null);
  let usernameDebounce: ReturnType<typeof setTimeout> | null = null;
  function checkUsernameAvailability() {
    // Stop the previous debounce timer if it exists
    if (usernameDebounce) clearTimeout(usernameDebounce);

    // Set the validation result to the checking availability state
    validationResult = UsernameCheckingAvailabilityValRes;

    // Start a new username request in 250ms
    usernameDebounce = setTimeout(async () => {
      // 250ms has passed, check if the username is available
      try {
        // Make the API request
        const response = await accountApi.accountCheckUsername({ username: value });

        // Map the response to a validation result
        validationResult = mapUsernameAvailability(response.availability);
      } catch (e) {
        // Show an error toast
        await handleApiError(e, toastStore);

        // Set the validation result to the internal server error state
        validationResult = UsernameInternalServerErrorValRes;
      }

      // Clear the debounce timer
      usernameDebounce = null;
    }, 250);
  }

  $effect(() => {
    if (validate) {
      const valRes = validateUsername(value);
      if (valRes?.valid) {
        // Basic validation passed, check availability
        checkUsernameAvailability();
      } else {
        // Basic validation failed, return the failed validation result
        validationResult = valRes;
      }
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
  {oninput}
/>
