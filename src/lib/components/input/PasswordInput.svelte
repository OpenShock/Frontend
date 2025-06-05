<script lang="ts">
  import { Eye, EyeOff } from '@lucide/svelte';
  import { checkPwnedCount } from '$lib/api/pwnedPasswords';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { validatePassword } from '$lib/inputvalidation/passwordValidator';
  import type { AnyComponent } from '$lib/types/AnyComponent';
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import type { TimeoutHandle } from '$lib/types/WAPI';
  import type { FullAutoFill } from 'svelte/elements';
  import PasswordStrengthMeter from './impl/PasswordStrengthMeter.svelte';

  interface Props {
    label: string;
    placeholder?: string;
    autocomplete?: FullAutoFill;
    value: string;
    valueShown?: boolean;
    valid?: boolean;
    validate?: boolean | 'string' | 'pwned' | ValidationResult | null;
    showStrengthMeter?: boolean;
    Icon?: AnyComponent;
  }

  let {
    label,
    placeholder,
    autocomplete = 'current-password',
    value = $bindable(),
    valueShown = $bindable(false),
    valid = $bindable(false),
    validate = false,
    showStrengthMeter = false,
    Icon,
  }: Props = $props();

  let validationResult = $state<ValidationResult | null>(null);
  let passwordDebounce: TimeoutHandle | null = null;
  function checkHIBP(str: string) {
    // Stop the previous debounce timer if it exists
    if (passwordDebounce) clearTimeout(passwordDebounce);

    // Set the validation result to the checking availability state
    validationResult = { valid: false, message: 'Checking password...' };

    // Start a new username request in 500ms
    passwordDebounce = setTimeout(async () => {
      // 500ms has passed, check if the password has been pwned
      try {
        // Make the API request
        const pwnedCount = await checkPwnedCount(str);

        // Map the response to a validation result
        if (pwnedCount > 0) {
          // Password has been pwned, change the validation result
          validationResult = {
            valid: false,
            message: `Password detected in ${pwnedCount} data ${pwnedCount == 1 ? 'breach' : 'breaches'}`,
            link: {
              text: "What's this?",
              href: 'https://haveibeenpwned.com/Passwords',
            },
          };
        } else {
          // Password is ok, return the successful validation result from the basic validation step
          validationResult = { valid: true };
        }
      } catch (e) {
        // Show an error toast
        await handleApiError(e);

        // We shouldnt block the user from submitting the form if the pwned password check fails
        validationResult = { valid: true };
      }
    }, 500);
  }

  $effect(() => {
    if (validate === true || validate === 'string') {
      // Do basic password validation
      const valres = validatePassword(value);
      if (valres?.valid) {
        // Basic validation passed, check if the password has been pwned
        checkHIBP(value);
      } else {
        // Basic validation failed, return the failed validation result
        validationResult = valres;
      }
    } else if (validate === 'pwned') {
      checkHIBP(value);
    } else if (validate === false) {
      // Only if validate is set to false will the password be considered valid
      validationResult = { valid: validate === false };
    } else {
      // If validate is a ValidationResult object, use it as the validation result
      validationResult = validate;
    }
  });

  $effect(() => {
    valid = validationResult?.valid ?? false;
  });

  // Logic to hide the popup after 3 seconds of inactivity
  let showPopup = $state(false);
  let typingTimeout: ReturnType<typeof setTimeout> | null = null;
  $effect(() => {
    // If value is not empty, set isTyping to true, then start a timeout to set it to false after 3 seconds
    if (showStrengthMeter && value.length) {
      showPopup = true;
      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        showPopup = false;
      }, 500);
    } else {
      // If value is empty, set isTyping to false
      showPopup = false;
    }
  });
</script>

{#snippet popup()}
  <PasswordStrengthMeter password={value} />
{/snippet}

<TextInput
  type={valueShown ? 'text' : 'password'}
  {label}
  {placeholder}
  {autocomplete}
  bind:value
  {validationResult}
  {Icon}
  button={{
    Icon: valueShown ? EyeOff : Eye,
    class: 'cursor-pointer',
    onClick: () => (valueShown = !valueShown),
  }}
  onblur={() => (showPopup = false)}
  popup={showPopup ? popup : undefined}
/>
