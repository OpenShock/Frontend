<script lang="ts">
  import { checkPwnedCount } from '$lib/api/pwnedPasswords';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { validatePassword } from '$lib/inputvalidation/passwordValidator';
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import { randStr } from '$lib/utils/rand';
  import { type PopupSettings, getToastStore } from '@skeletonlabs/skeleton';
  import TextInput from './TextInput.svelte';
  import PasswordStrengthMeter from './impl/PasswordStrengthMeter.svelte';
  import type { ButtonSettings } from './impl/ButtonSettings';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  const toastStore = getToastStore();

  export let label: string;
  export let placeholder: string | undefined = undefined;
  export let autocomplete: string | undefined = 'current-password';
  export let value: string;
  export let valueShown = false;
  export let valid: boolean = false;
  export let validate: boolean | 'string' | 'pwned' | ValidationResult | null = false;

  export let showStrengthMeter = false;

  export let icon: `fa-${string}` | undefined = undefined;

  const popupSettings: PopupSettings = {
    event: 'focus-blur',
    target: 'popupStrengthMeter-' + randStr(8),
    placement: 'left-start',
  };

  let validationResult: ValidationResult | null = null;
  let passwordDebounce: ReturnType<typeof setTimeout> | null = null;
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
            message: `Password detected in ${pwnedCount} data breaches`,
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
        await handleApiError(e, toastStore);

        // We shouldnt block the user from submitting the form if the pwned password check fails
        validationResult = { valid: true };
      }
    }, 500);
  }

  $: if (validate === true || validate === 'string') {
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

  $: valid = validationResult?.valid ?? false;

  let button: ButtonSettings;
  $: button = {
    icon: valueShown ? 'fa-eye-slash' : 'fa-eye',
    class: 'cursor-pointer',
    onClick: () => (valueShown = !valueShown),
  };

  function handleInput(event: CustomEvent<any>) {
    const target = event.currentTarget as HTMLInputElement;
    value = target.value;
    dispatch('input', event);
  }
</script>

<TextInput
  type={valueShown ? 'text' : 'password'}
  {label}
  {placeholder}
  {autocomplete}
  bind:value
  {validationResult}
  {icon}
  {button}
  {popupSettings}
  on:input={handleInput}
>
  <svelte:fragment slot="popup">
    {#if showStrengthMeter}
      <PasswordStrengthMeter popupTarget={popupSettings.target} password={value} />
    {/if}
  </svelte:fragment>
</TextInput>
