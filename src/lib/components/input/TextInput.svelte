<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as Popover from '$lib/components/ui/popover';
  import { GetValResColor, type ValidationResult } from '$lib/types/ValidationResult';
  import type { Snippet } from 'svelte';
  import type { FullAutoFill } from 'svelte/elements';
  import type { ButtonSettings } from './impl/ButtonSettings';
  import type { AnyComponent } from '$lib/types/AnyComponent';

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
    oninput?: (input: string) => void | undefined;
  }

  let {
    type = 'text',
    label,
    placeholder,
    autocomplete,
    value = $bindable(''),
    validationResult,
    Icon,
    button,
    popup,
    oninput,
  }: Props = $props();

  function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
    value = event.currentTarget.value;
    if (oninput) {
      oninput(value);
    }
  }
</script>

<label class="label w-full">
  <span>{label}</span>
  <div class="flex flex-row items-center gap-2">
    <div class="input-group input-group-divider flex grow flex-row gap-2">
      {#if Icon}
        <Icon />
      {/if}
      <Input
        {type}
        class="input grow"
        title={label}
        {placeholder}
        {autocomplete}
        {value}
        oninput={handleInput}
      />
      {#if button}
        <Button
          type="button"
          class={button.class ?? 'variant-filled-primary disabled:opacity-50'}
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
  </div>
  {#if validationResult?.message}
    <p class="text-xs text-{GetValResColor(validationResult)} mt-0!">
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
    <Popover.Root>
      <Popover.Content>
        {@render popup()}
      </Popover.Content>
    </Popover.Root>
  {/if}
</label>
