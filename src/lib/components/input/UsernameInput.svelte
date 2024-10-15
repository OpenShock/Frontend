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
  import TextInput from '$lib/components/input/TextInput.svelte';

  const toastStore = getToastStore();

  export let label: string = 'Username';
  export let placeholder: string | undefined = 'Username';
  export let autocomplete: string | undefined = 'username';
  export let value: string;
  export let valid: boolean = false;
  export let validate: boolean = true;

  export let icon: string | undefined = undefined;
  export let button: { text: string; variant?: string; onClick: () => void } | undefined =
    undefined;

  let validationResult: ValidationResult | null = null;
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

  $: if (validate) {
    const valRes = validateUsername(value);
    if (valRes?.valid) {
      // Basic validation passed, check availability
      checkUsernameAvailability();
    } else {
      // Basic validation failed, return the failed validation result
      validationResult = valRes;
    }
  } else {
    validationResult = { valid: true };
  }

  $: valid = validationResult?.valid ?? false;
</script>

<TextInput {label} {placeholder} {autocomplete} bind:value {validationResult} {icon} {button} />
