<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import type { AnyComponent } from '$lib/types/AnyComponent';
  import { GetValResColor, type ValidationResult } from '$lib/types/ValidationResult';
  import type { Snippet } from 'svelte';
  import type { FocusEventHandler, FullAutoFill } from 'svelte/elements';
  import type { ButtonSettings } from './impl/ButtonSettings';

  interface Props {
    type?: 'text' | 'password';
    label: string;
    placeholder?: string;
    autocomplete?: FullAutoFill;
    value: string;
    validationResult?: ValidationResult | null;
    Icon?: AnyComponent;
    button?: ButtonSettings;
    popup?: Snippet;
    onblur?: FocusEventHandler<HTMLInputElement> | null;
  }

  const id = $props.id();
  const inputId = id + '-input';
  const validationId = id + '-validation';
  let {
    type = 'text',
    label,
    placeholder,
    autocomplete,
    value = $bindable(),
    validationResult,
    Icon,
    button,
    popup,
    onblur,
  }: Props = $props();
</script>

<label for={inputId} class="w-full">
  <span>{label}</span>
  <div class="relative flex grow flex-row items-center gap-2">
    {#if Icon}
      <Icon />
    {/if}
    <Input
      id={inputId}
      {type}
      class="grow"
      title={label}
      {placeholder}
      {autocomplete}
      bind:value
      {onblur}
      aria-invalid={validationResult ? !validationResult.valid : undefined}
      aria-describedby={validationResult ? validationId : undefined}
    />
    {#if popup}
      <div
        class="absolute left-0 top-full mt-1 w-full z-10 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 p-1"
        role="tooltip"
      >
        {@render popup()}
      </div>
    {/if}
    {#if button}
      <Button
        type="button"
        class={button.class ?? 'disabled:opacity-50'}
        onclick={button.onClick}
        disabled={button.submits &&
          (validationResult === null || (validationResult && !validationResult.valid))}
      >
        {#if 'Icon' in button}
          <button.Icon />
        {:else if 'text' in button}
          {button.text}
        {/if}
      </Button>
    {/if}
  </div>
  {#if validationResult?.message}
    <p id={validationId} class="text-xs text-{GetValResColor(validationResult)} mt-0! h-4 truncate">
      {validationResult.message}
      {#if validationResult.link}
        <a
          href={validationResult.link.href}
          target="_blank"
          rel="noreferrer"
          class="text-blue-500 underline"
        >
          {validationResult.link.text}
        </a>
      {/if}
    </p>
  {:else}
    <div class="h-4"></div>
  {/if}
</label>
