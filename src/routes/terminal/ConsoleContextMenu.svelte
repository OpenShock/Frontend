<script lang="ts">
  import { ContextMenu } from 'bits-ui';
  import { Check, ChevronRight, Copy, Maximize2, Minimize2, Palette } from '@lucide/svelte';
  import type { Snippet } from 'svelte';
  import { copyToClipboard } from '@openshock/svelte-core/utils';
  import type { TerminalSettings } from './terminal-settings.svelte';
  import { TIMESTAMP_LABELS, TIMESTAMP_MODES } from './constants';
  import type { TimestampMode } from './types';

  interface Props {
    settings: TerminalSettings;
    maximized: boolean;
    onMaximizedChange: (value: boolean) => void;
    onStickToBottomChange: (value: boolean) => void;
    onCopyOutput: () => void;
    onOpenColors: () => void;
    /** Receives the trigger props to spread onto the element that should open the menu. */
    children: Snippet<[{ props: Record<string, unknown> }]>;
  }

  let {
    settings,
    maximized,
    onMaximizedChange,
    onStickToBottomChange,
    onCopyOutput,
    onOpenColors,
    children,
  }: Props = $props();

  // Snapshot the text selection when the menu opens, so "Copy selection" can offer it.
  let selectedText = $state('');

  function handleOpenChange(open: boolean) {
    if (open) {
      selectedText = window.getSelection()?.toString() ?? '';
    }
  }

  function copySelection() {
    void copyToClipboard(selectedText, 'Selection copied');
  }

  // svelte-core ships dropdown-menu components but no context-menu ones, and the two bits-ui
  // primitives are not interchangeable.
  // These mirror the dropdown-menu styles so both console menus look the same.
  // Replace with a svelte-core context-menu component set once one exists.

  // Mirrors dropdown-menu-content.svelte.
  const contentClass =
    'bg-popover text-popover-foreground ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 z-50 min-w-48 origin-(--bits-context-menu-content-transform-origin) overflow-hidden rounded-sm p-1 shadow-md ring-1 duration-100';
  // Mirrors dropdown-menu-item.svelte, also used for sub triggers.
  const itemClass =
    "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-1.5 rounded-sm px-1.5 py-1 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
  // Checkbox and radio items reserve room on the right for the check mark.
  const checkItemClass = `${itemClass} pr-8`;
  // Mirrors dropdown-menu-separator.svelte.
  const separatorClass = 'bg-border -mx-1 my-1 h-px';
</script>

<ContextMenu.Root onOpenChange={handleOpenChange}>
  <ContextMenu.Trigger>
    {#snippet child({ props })}
      {@render children({ props })}
    {/snippet}
  </ContextMenu.Trigger>
  <ContextMenu.Portal>
    <ContextMenu.Content class={contentClass}>
      {#if selectedText}
        <ContextMenu.Item class={itemClass} onSelect={copySelection}>
          <Copy />
          Copy selection
        </ContextMenu.Item>
      {/if}
      <ContextMenu.Item class={itemClass} onSelect={onCopyOutput}>
        <Copy />
        Copy all output
      </ContextMenu.Item>

      <ContextMenu.Separator class={separatorClass} />

      <ContextMenu.CheckboxItem
        class={checkItemClass}
        closeOnSelect={false}
        checked={settings.hideSystem}
        onCheckedChange={(v) => (settings.hideSystem = v)}
      >
        {#snippet children({ checked })}
          {@render indicator(checked)}
          Hide system messages
        {/snippet}
      </ContextMenu.CheckboxItem>
      <ContextMenu.CheckboxItem
        class={checkItemClass}
        closeOnSelect={false}
        checked={settings.stickToBottom}
        onCheckedChange={onStickToBottomChange}
      >
        {#snippet children({ checked })}
          {@render indicator(checked)}
          Stick to bottom
        {/snippet}
      </ContextMenu.CheckboxItem>
      <ContextMenu.CheckboxItem
        class={checkItemClass}
        closeOnSelect={false}
        checked={settings.rawMode}
        onCheckedChange={(v) => (settings.rawMode = v)}
      >
        {#snippet children({ checked })}
          {@render indicator(checked)}
          Raw output
        {/snippet}
      </ContextMenu.CheckboxItem>

      <ContextMenu.Sub>
        <ContextMenu.SubTrigger class={itemClass}>
          Timestamps
          <span class="text-muted-foreground ml-auto text-xs">
            {TIMESTAMP_LABELS[settings.timestampMode]}
          </span>
          <ChevronRight />
        </ContextMenu.SubTrigger>
        <ContextMenu.SubContent class={contentClass} sideOffset={4}>
          <ContextMenu.RadioGroup
            value={settings.timestampMode}
            onValueChange={(v) => (settings.timestampMode = v as TimestampMode)}
          >
            {#each TIMESTAMP_MODES as m (m)}
              <ContextMenu.RadioItem class={checkItemClass} closeOnSelect={false} value={m}>
                {#snippet children({ checked })}
                  {@render indicator(checked)}
                  {TIMESTAMP_LABELS[m]}
                {/snippet}
              </ContextMenu.RadioItem>
            {/each}
          </ContextMenu.RadioGroup>
        </ContextMenu.SubContent>
      </ContextMenu.Sub>

      <ContextMenu.Separator class={separatorClass} />

      <ContextMenu.Item class={itemClass} onSelect={() => onMaximizedChange(!maximized)}>
        {#if maximized}
          <Minimize2 />
          Exit fullscreen
        {:else}
          <Maximize2 />
          Fill the window
        {/if}
      </ContextMenu.Item>
      <ContextMenu.Item class={itemClass} onSelect={onOpenColors}>
        <Palette />
        Colors...
      </ContextMenu.Item>
    </ContextMenu.Content>
  </ContextMenu.Portal>
</ContextMenu.Root>

{#snippet indicator(checked: boolean)}
  <span class="pointer-events-none absolute right-2 flex items-center justify-center">
    {#if checked}
      <Check />
    {/if}
  </span>
{/snippet}
