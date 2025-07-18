<script lang="ts">
  import { accountV2Api } from '$lib/api';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import type { ButtonSettings } from '$lib/components/input/impl/ButtonSettings';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import {
    UsernameCheckingAvailabilityValRes,
    UsernameInternalServerErrorValRes,
    mapUsernameAvailability,
    validateUsername,
  } from '$lib/inputvalidation/usernameValidator';
  import type { AnyComponent } from '$lib/types/AnyComponent';
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import type { TimeoutHandle } from '$lib/types/WAPI';
  import type { FullAutoFill } from 'svelte/elements';

  interface Props {
    label: string;
    placeholder?: string;
    autocomplete?: FullAutoFill;
    value: string;
    valid?: boolean;
    validate?: boolean;
    Icon?: AnyComponent;
    button?: ButtonSettings;
  }

  let {
    label,
    placeholder,
    autocomplete = 'username',
    value = $bindable(),
    valid = $bindable(false),
    validate = true,
    Icon,
    button,
  }: Props = $props();

  let validationResult = $state<ValidationResult | null>(null);
  let usernameDebounce: TimeoutHandle | undefined;
  function checkUsernameAvailability() {
    // Stop the previous debounce timer if it exists
    clearTimeout(usernameDebounce);

    // Set the validation result to the checking availability state
    validationResult = UsernameCheckingAvailabilityValRes;

    // Start a new username request in 250ms
    usernameDebounce = setTimeout(async () => {
      // 250ms has passed, check if the username is available
      try {
        // Make the API request
        const response = await accountV2Api.accountCheckUsername({ username: value });

        // Map the response to a validation result
        validationResult = mapUsernameAvailability(response.availability);
      } catch (error) {
        // Show an error toast
        await handleApiError(error);

        // Set the validation result to the internal server error state
        validationResult = UsernameInternalServerErrorValRes;
      }
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
    } else {
      validationResult = { valid: true };
    }
  });
  $effect(() => {
    valid = validationResult?.valid ?? false;
  });
</script>

<TextInput {label} {placeholder} {autocomplete} bind:value {validationResult} {Icon} {button} />
