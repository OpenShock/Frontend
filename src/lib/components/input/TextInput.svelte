<script lang="ts">
  import { Input } from '$lib/components/ui/input';
  import type { AnyComponent } from '$lib/types/AnyComponent';
  import { GetValResColor, type ValidationResult } from '$lib/types/ValidationResult';
  import { cn } from '$lib/utils/shadcn.js';
  import type { Snippet } from 'svelte';
  import type { ClipboardEventHandler, FocusEventHandler, FullAutoFill } from 'svelte/elements';
  import {
    FieldGroup,
    Field,
    FieldLabel,
    FieldDescription,
    FieldSeparator,
  } from '$lib/components/ui/field/index.js';

  interface Props {
    type?: 'text' | 'email' | 'password' | 'search' | 'url';
    label?: string;
    labelSnippet?: Snippet<[string]>;
    placeholder?: string;
    autocomplete?: FullAutoFill;
    value: string;
    validationResult?: ValidationResult | null;
    Icon?: AnyComponent;
    after?: Snippet;
    popup?: Snippet;
    onblur?: FocusEventHandler<HTMLInputElement> | null;
    onpaste?: ClipboardEventHandler<HTMLInputElement> | null;
  }

  const id = $props.id();
  const validationId = id + '-validation';
  let {
    type = 'text',
    label,
    labelSnippet,
    placeholder,
    autocomplete,
    value = $bindable(),
    validationResult,
    Icon,
    after,
    popup,
    onblur,
    onpaste,
  }: Props = $props();
</script>

<Field>
  {#if labelSnippet}
    {@render labelSnippet(id)}
  {/if}

  {#if label}
    <FieldLabel for={id}>{label}</FieldLabel>
  {/if}

  <div class="relative flex grow flex-row items-center gap-2">
    {#if Icon}
      <Icon />
    {/if}
    <div
      class={cn(
        'flex w-full items-center',
        after &&
          'border-input bg-background dark:bg-input/30 h-9 rounded-md border pr-1 shadow-xs transition-[color,box-shadow] has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-ring/50 has-[input:focus-visible]:ring-[3px] has-[input[aria-invalid=true]]:ring-destructive/20 dark:has-[input[aria-invalid=true]]:ring-destructive/40 has-[input[aria-invalid=true]]:border-destructive',
      )}
    >
      <Input
        {id}
        {type}
        class={cn(
          after
            ? 'flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent'
            : 'grow',
        )}
        title={label}
        {placeholder}
        {autocomplete}
        bind:value
        {onblur}
        {onpaste}
        aria-invalid={validationResult ? !validationResult.valid : undefined}
        aria-describedby={validationResult?.message ? validationId : undefined}
      />
      {#if after}
        {@render after()}
      {/if}
    </div>
    {#if popup}
      <div
        class="absolute top-full left-0 z-10 mt-1 w-full rounded-md border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        role="tooltip"
      >
        {@render popup()}
      </div>
    {/if}
  </div>
  {#if validationResult?.message}
    <p
      id={validationId}
      class={cn('mt-0! h-4 truncate text-xs', `text-${GetValResColor(validationResult)}`)}
      role="status"
      aria-atomic="true"
      aria-live="polite"
    >
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
    <div class="h-4" aria-hidden="true"></div>
  {/if}
</Field>
