<script lang="ts">
  import { base } from '$app/paths';
  import { Input } from '$lib/components/ui/input';
  import type { AnyComponent } from '$lib/types/AnyComponent';
  import { GetValResColor, type ValidationResult } from '$lib/types/ValidationResult';
  import { cn } from '$lib/utils/shadcn.js';
  import { unsafeResolve } from '$lib/utils/url';
  import type { Snippet } from 'svelte';
  import type { ClipboardEventHandler, FocusEventHandler, FullAutoFill } from 'svelte/elements';

  interface Props {
    type?: 'text' | 'email' | 'password' | 'search' | 'url';
    label?: string;
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

  /* eslint-disable svelte/no-navigation-without-resolve */
</script>

<label class="w-full">
  {#if label}
    <span>{label}</span>
  {/if}
  <div class="relative flex grow flex-row items-center gap-2">
    {#if Icon}
      <Icon />
    {/if}
    <Input
      {type}
      class="grow"
      title={label}
      {placeholder}
      {autocomplete}
      bind:value
      {onblur}
      {onpaste}
      aria-invalid={validationResult ? !validationResult.valid : undefined}
      aria-describedby={validationResult?.message ? validationId : undefined}
    />
    {#if popup}
      <div
        class="absolute top-full left-0 z-10 mt-1 w-full rounded-md border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        role="tooltip"
      >
        {@render popup()}
      </div>
    {/if}
    {#if after}
      {@render after()}
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
        <!-- This must not be resolved, it in some cases points to external websites (HaveIBeenPwned) -->
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
</label>
