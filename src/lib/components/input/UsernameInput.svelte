<script lang="ts">
  import { accountV2Api } from '$lib/api';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import { isValidationError, mapToValRes } from '$lib/errorhandling/ValidationProblemDetails';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import {
    UsernameCheckingAvailabilityValRes,
    UsernameInternalServerErrorValRes,
    mapUsernameCheckResponse,
    validateUsername,
  } from '$lib/inputvalidation/usernameValidator';
  import type { AnyComponent } from '$lib/types/AnyComponent';
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import { useDebounce } from '$lib/utils/debounce';
  import type { Snippet } from 'svelte';
  import type { FullAutoFill } from 'svelte/elements';

  interface Props {
    label: string;
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
    autocomplete = 'username',
    value = $bindable(),
    valid = $bindable(false),
    validate = true,
    Icon,
    after,
  }: Props = $props();

  let checkResponses = $state<Map<string, ValidationResult>>(new Map());
  let validationResult = $state<ValidationResult | null>(null);

  const requestAvailability = useDebounce(async (username: string) => {
    try {
      const response = await accountV2Api.accountCheckUsername({ username });
      validationResult = mapUsernameCheckResponse(response);
      checkResponses.set(username, validationResult);
    } catch (error) {
      await handleApiError(error, (err) => {
        if (!isValidationError(err)) {
          validationResult = UsernameInternalServerErrorValRes;
          return false;
        }

        const apiValRes = mapToValRes(err, 'Username');
        if (apiValRes !== null) {
          validationResult = apiValRes;
          return true;
        }

        return false;
      });
    }
  }, 250);

  function checkUsernameAvailability(username: string) {
    const entry = checkResponses.get(username);
    if (entry !== undefined) {
      requestAvailability.cancel();
      validationResult = entry;
      return;
    }

    validationResult = UsernameCheckingAvailabilityValRes;
    requestAvailability(username);
  }

  $effect(() => {
    if (validate) {
      const valRes = validateUsername(value);
      if (valRes?.valid) {
        // Basic validation passed, check availability
        checkUsernameAvailability(value);
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

<TextInput
  type="text"
  {label}
  {placeholder}
  {autocomplete}
  bind:value
  {validationResult}
  {Icon}
  {after}
/>
