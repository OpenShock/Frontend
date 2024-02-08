<script lang="ts">
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

  function onInput(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    valueShown = false;
    value = e.currentTarget.value;
  }

  const popupSettings: PopupSettings = {
    event: 'focus-blur',
    target: 'popupStrengthMeter-' + randStr(8),
    placement: 'left-start',
  };

  let passwordStrength = 0;
  let passwordStrengthColor = '';
  let passwordStrengthText = '';
  let passwordStrengthArrow: HTMLDivElement;

  $: if (showPasswordStrength) {
    if (value.length === 0) {
      passwordStrength = 0;
      passwordStrengthColor = 'text-gray-500';
      passwordStrengthText = '';
    }
    passwordStrength = Math.min((calculateStringEntropy(value) / 120) * 100, 100);
    if (passwordStrength < 30) {
      passwordStrengthColor = 'text-red-500';
      passwordStrengthText = 'Very weak';
    } else if (passwordStrength < 50) {
      passwordStrengthColor = 'text-orange-500';
      passwordStrengthText = 'Weak';
    } else if (passwordStrength < 60) {
      passwordStrengthColor = 'text-yellow-500';
      passwordStrengthText = 'Fair';
    } else if (passwordStrength < 99) {
      passwordStrengthColor = 'text-green-500';
      passwordStrengthText = 'Strong';
    } else {
      passwordStrengthColor = 'text-cyan-500';
      passwordStrengthText = 'Very strong';
    }
    if (passwordStrengthArrow) {
      passwordStrengthArrow.style.left = `${passwordStrength}%`;
    }
  }

  $: inputProps = {
    class: 'input',
    type: valueShown ? 'text' : 'password',
    title: label,
    placeholder,
    autocomplete,
    value,
  };
</script>

<label class="label">
  <span>{label}</span>
  <div class="input-group input-group-divider grid-cols-[1fr_auto]">
    <input {...inputProps} on:input={onInput} use:popup={popupSettings} />
    <div>
      <button
        class={'fa-solid !m-0 h-[20px] w-[20px] cursor-pointer !p-0 ' +
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
        <p class={`text-sm ${passwordStrengthColor}`}>{passwordStrengthText}</p>
      </div>
      <div class="arrow arrow-borderfix bg-surface-100-800-token" />
      <div class="pt-2 h-1 w-full flex flex-row items-center space-x-1">
        <div class="h-1 bg-red-500" style="flex: 3 3 0%"></div>
        <div class="h-1 bg-orange-500" style="flex: 2 2 0%"></div>
        <div class="h-1 bg-yellow-500" style="flex: 1 1 0%"></div>
        <div class="h-1 bg-green-500" style="flex: 4 4 0%"></div>
      </div>
      <!-- Arrow -->
      <div class="relative w-full h-0">
        <div
          bind:this={passwordStrengthArrow}
          class="absolute w-2 h-2 bg-black dark:bg-white transform rotate-45 -translate-x-1 -translate-y-1"
        />
      </div>
    </div>
  {/if}
</label>

<style>
  .arrow-borderfix {
    border-width: 1px 1px 0 0;
    border-style: solid;
    border-color: #cccccc;
  }

  :global(.dark) .arrow-borderfix {
    border-color: #222222;
  }
</style>
