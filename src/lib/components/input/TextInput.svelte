<script lang="ts">
  import { GetValResColor, type ValidationResult } from '$lib/types/ValidationResult';
  import type { Snippet } from 'svelte';
  import type { FullAutoFill } from 'svelte/elements';
  import type { ButtonSettings } from './impl/ButtonSettings';
  import { popup as popupAction, type PopupSettings } from '@skeletonlabs/skeleton';
  
  interface Props {
    type?: 'text' | 'password';
    label: string;
    placeholder?: string;
    autocomplete?: FullAutoFill;
    value: string;
    validationResult?: ValidationResult | null;
    icon?: `fa-${string}`;
    button?: ButtonSettings;
    popup?: Snippet;
    popupSettings?: PopupSettings;
    oninput?: (input: string) => void | undefined;
  }

  let {
    type = 'text',
    label,
    placeholder,
    autocomplete,
    value = $bindable(''),
    validationResult,
    icon,
    button,
    popup,
    popupSettings,
    oninput
  }: Props = $props();

  function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
    if (!oninput) return;

    const target = event.currentTarget;

    oninput(target.value);
  }

  function popupProxy(triggerNode: HTMLElement): {
    update(args: PopupSettings): void;
    destroy(): void;
  } {
    if (popup === undefined || popupSettings === undefined) {
      return {
        update: () => {},
        destroy: () => {},
      };
    }

    return popupAction(triggerNode, popupSettings);
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
        oninput={handleInput}
        use:popupProxy
      />
      {#if button}
        <button
          type="button"
          class={button.class ?? 'variant-filled-primary disabled:opacity-50'}
          onclick={button.onClick}
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
  {#if popup}
    {@render popup()}
  {/if}
</label>
