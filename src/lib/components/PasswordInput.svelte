<script lang="ts">
  import { checkPwnedCount } from '$lib/api/pwnedPasswords';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { getPasswordStrength, validatePassword } from '$lib/inputvalidation/passwordValidator';
  import type { TwTextColor } from '$lib/types/Tailwind';
  import { GetValResColor, type ValidationResult } from '$lib/types/ValidationResult';
  import { randStr } from '$lib/utils/rand';
  import { popup, type PopupSettings, getToastStore } from '@skeletonlabs/skeleton';

  const toastStore = getToastStore();

  export let label: string = 'Password';
  export let placeholder: string | undefined = 'Password';
  export let autocomplete: string | undefined = 'current-password';
  export let value: string;
  export let valueShown = false;
  export let valid: boolean = false;
  export let validate: boolean | 'string' | 'pwned' | ValidationResult | null = false;

  export let showStrengthMeter = false;

  export let icon: string | undefined = undefined;

  const popupSettings: PopupSettings = {
    event: 'focus-blur',
    target: 'popupStrengthMeter-' + randStr(8),
    placement: 'left-start',
  };

  // pwsm = Password Strength Meter
  let strength: ReturnType<typeof getPasswordStrength> | null = null;
  let pwsmArrow: HTMLDivElement;

  $: if (showStrengthMeter) {
    strength = getPasswordStrength(value);

    if (pwsmArrow) {
      pwsmArrow.style.left = `${strength.percent}%`;
    }
  }

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
  } else if (validate && 'valid' in validate) {
    validationResult = validate;
  } else {
    // Only if validate is set to false will the password be considered valid
    validationResult = { valid: validate === false };
  }

  $: valid = validationResult?.valid ?? false;
</script>

<label class="label">
  <span>{label}</span>
  <div class="input-group input-group-divider grid-cols-[1fr_auto]">
    {#if icon}
      <div class="input-group-shim fa {icon}"></div>
    {/if}
    <input
      class="input"
      type={valueShown ? 'text' : 'password'}
      title={label}
      {placeholder}
      {autocomplete}
      {value}
      on:input={(e) => {
        valueShown = false;
        value = e.currentTarget.value;
      }}
      use:popup={popupSettings}
    />
    <div>
      <button
        type="button"
        class={'fa !m-0 h-[20px] w-[20px] cursor-pointer !p-0 ' +
          (valueShown ? 'fa-eye-slash' : 'fa-eye')}
        aria-label="Toggle password visibility"
        on:click={() => (valueShown = !valueShown)}
      >
      </button>
    </div>
  </div>
  {#if validationResult && 'message' in validationResult}
    <p class="text-xs text-{GetValResColor(validationResult)} !mt-0">{validationResult.message}</p>
  {:else}
    <div class="h-3"></div>
  {/if}
  {#if strength}
    <div class="card p-4 w-72 shadow-xl" data-popup={popupSettings.target}>
      <div class="flex flex-row items-center space-x-1">
        <p class="text-sm text-gray-500">Password strength:</p>
        <p class={`text-sm text-${strength.color}`}>{strength.text}</p>
      </div>
      <div class="arrow bg-surface-100-800-token"></div>
      <div class="pt-2 h-1 w-full flex flex-row items-center space-x-1">
        <div class="h-1 bg-red-500" style="flex: 3 3 0%"></div>
        <div class="h-1 bg-orange-500" style="flex: 2 2 0%"></div>
        <div class="h-1 bg-yellow-500" style="flex: 1 1 0%"></div>
        <div class="h-1 bg-green-500" style="flex: 4 4 0%"></div>
      </div>
      <!-- Arrow -->
      <div class="relative w-full h-0">
        <div
          bind:this={pwsmArrow}
          class="absolute w-2 h-2 bg-black dark:bg-white transform rotate-45 -translate-x-1 -translate-y-1"
        ></div>
      </div>
    </div>
  {/if}
</label>
