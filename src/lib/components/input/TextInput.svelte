<script lang="ts">
  import { GetValResColor, type ValidationResult } from '$lib/types/ValidationResult';
  import { createEventDispatcher } from 'svelte';
  import type { ButtonSettings } from './impl/ButtonSettings';
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';

  const dispatch = createEventDispatcher();

  export let type: 'text' | 'password' = 'text';
  export let label: string;
  export let placeholder: string | undefined = undefined;
  export let autocomplete: string | undefined = undefined;
  export let value: string;
  export let validationResult: ValidationResult | null | undefined = undefined;

  export let icon: `fa-${string}` | undefined = undefined;
  export let button: ButtonSettings | undefined = undefined;

  export let popupSettings: PopupSettings | undefined = undefined;

  function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
    const target = event.currentTarget;
    value = target.value;
    dispatch('input', event);
  }

  function popupProxy(triggerNode: HTMLElement): {
    update(args: PopupSettings): void;
    destroy(): void;
  } {
    if (popupSettings === undefined) {
      return {
        update: () => {},
        destroy: () => {},
      };
    }

    return popup(triggerNode, popupSettings);
  }
</script>

<label class="label w-full">
  <span>{label}</span>
  <div class="flex flex-row items-center gap-2">
    <div class="input-group input-group-divider flex-grow flex flex-row gap-2">
      {#if icon}
        <div class="input-group-shim fa {icon}"></div>
      {/if}
      <input
        {type}
        class="input flex-grow"
        title={label}
        {placeholder}
        {autocomplete}
        {value}
        on:input={handleInput}
        use:popupProxy
      />
      {#if button}
        <button
          type="button"
          class={button.class ?? 'variant-filled-primary disabled:opacity-50'}
          on:click={button.onClick}
          disabled={button.submits &&
            (validationResult === null || (validationResult && !validationResult.valid))}
        >
          {#if 'icon' in button}
            <i class="fa {button.icon}"></i>
          {:else if 'text' in button}
            {button.text}
          {/if}
        </button>
      {/if}
    </div>
  </div>
  {#if validationResult?.message}
    <p class="text-xs text-{GetValResColor(validationResult)} !mt-0">
      {validationResult.message}
      {#if validationResult.link}
        <a
          href={validationResult.link.href}
          target="_blank"
          rel="noreferrer"
          class="text-xs text-blue-500 underline"
        >
          {validationResult.link.text}
        </a>
      {/if}
    </p>
  {:else}
    <div class="h-3"></div>
  {/if}
  <slot name="popup" />
</label>
