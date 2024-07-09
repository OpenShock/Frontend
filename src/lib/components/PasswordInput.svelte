<script lang="ts">
  import type { TwTextColor } from '$lib/types/Tailwind';
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import { calculateStringEntropy } from '$lib/utils/entropy';
  import { randStr } from '$lib/utils/rand';
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';

  export let label = 'Password';
  export let placeholder = 'Password';
  export let autocomplete: 'new-password' | 'current-password';
  export let value: string;
  export let valueShown = false;
  export let validationResult: ValidationResult | null | undefined = undefined;
  export let showPasswordStrength = false;

  const popupSettings: PopupSettings = {
    event: 'focus-blur',
    target: 'popupStrengthMeter-' + randStr(8),
    placement: 'left-start',
  };

  // pwsm = Password Strength Meter
  let pwsmText: string;
  let pwsmColor: TwTextColor;
  let pwsmArrow: HTMLDivElement;

  $: {
    let strength: number;
    if (!showPasswordStrength || value.length === 0) {
      strength = 0;
      pwsmText = 'None';
      pwsmColor = 'text-gray-500';
    } else {
      strength = Math.min((calculateStringEntropy(value) / 120) * 100, 100);

      if (strength < 30) {
        pwsmText = 'Very weak';
        pwsmColor = 'text-red-500';
      } else if (strength < 50) {
        pwsmText = 'Weak';
        pwsmColor = 'text-orange-500';
      } else if (strength < 60) {
        pwsmText = 'Fair';
        pwsmColor = 'text-yellow-500';
      } else if (strength < 99) {
        pwsmText = 'Strong';
        pwsmColor = 'text-green-500';
      } else {
        pwsmText = 'Very strong';
        pwsmColor = 'text-cyan-500';
      }
    }

    if (pwsmArrow) {
      pwsmArrow.style.left = `${strength}%`;
    }
  }
</script>

<label class="label">
  <span>{label}</span>
  <div class="input-group input-group-divider grid-cols-[1fr_auto]">
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
        class={'fa !m-0 h-[20px] w-[20px] cursor-pointer !p-0 ' +
          (valueShown ? 'fa-eye-slash' : 'fa-eye')}
        type="button"
        on:click={() => (valueShown = !valueShown)}
      />
    </div>
  </div>
  {#if !validationResult || validationResult.valid}
    <div class="h-3" />
  {:else}
    <p class="text-xs text-red-500 !mt-0">{validationResult.message}</p>
  {/if}
  {#if showPasswordStrength}
    <div class="card p-4 w-72 shadow-xl" data-popup={popupSettings.target}>
      <div class="flex flex-row items-center space-x-1">
        <p class="text-sm text-gray-500">Password strength:</p>
        <p class={`text-sm ${pwsmColor}`}>{pwsmText}</p>
      </div>
      <div class="arrow bg-surface-100-800-token" />
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
        />
      </div>
    </div>
  {/if}
</label>
