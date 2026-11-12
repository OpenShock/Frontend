<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { ClipboardPaste, Copy, Maximize2, Minimize2, Palette, Settings2 } from '@lucide/svelte';
  import { buttonVariants } from '@openshock/svelte-core/components/ui/button';
  import * as DropdownMenu from '@openshock/svelte-core/components/ui/dropdown-menu';
  import { cn } from '@openshock/svelte-core/utils';
  import type { TerminalSettings } from './terminal-settings.svelte';
  import { TIMESTAMP_LABELS, TIMESTAMP_MODES } from './constants';
  import type { TimestampMode } from './types';

  interface Props {
    settings: TerminalSettings;
    maximized: boolean;
    onMaximizedChange: (value: boolean) => void;
    onStickToBottomChange: (value: boolean) => void;
    onOpenColors: () => void;
    onCopySettings: () => void;
    onImportSettings: () => void;
  }

  let {
    settings,
    maximized,
    onMaximizedChange,
    onStickToBottomChange,
    onOpenColors,
    onCopySettings,
    onImportSettings,
  }: Props = $props();
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    class={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
    title={m.terminal_options_label()}
    aria-label={m.terminal_options_label()}
  >
    <Settings2 class="mr-1 h-3.5 w-3.5" />
    {m.terminal_options()}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content
    align="end"
    class="min-w-48 rounded-sm [&_[data-slot$=item]]:rounded-sm [&_[data-slot$=sub-trigger]]:rounded-sm"
  >
    <DropdownMenu.CheckboxItem
      checked={settings.hideSystem}
      onCheckedChange={(v) => (settings.hideSystem = v)}
    >
      {m.terminal_hide_system()}
    </DropdownMenu.CheckboxItem>
    <DropdownMenu.CheckboxItem
      checked={settings.stickToBottom}
      onCheckedChange={onStickToBottomChange}
    >
      {m.terminal_stick_bottom()}
    </DropdownMenu.CheckboxItem>
    <DropdownMenu.CheckboxItem
      checked={settings.rawMode}
      onCheckedChange={(v) => (settings.rawMode = v)}
    >
      {m.terminal_raw_output()}
    </DropdownMenu.CheckboxItem>

    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>
        {m.terminal_timestamps()}
        <span class="text-muted-foreground ml-auto text-xs">
          {TIMESTAMP_LABELS[settings.timestampMode]()}
        </span>
      </DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent class="rounded-sm [&_[data-slot$=item]]:rounded-sm">
        <DropdownMenu.RadioGroup
          value={settings.timestampMode}
          onValueChange={(v) => (settings.timestampMode = v as TimestampMode)}
        >
          {#each TIMESTAMP_MODES as tsMode (tsMode)}
            <DropdownMenu.RadioItem value={tsMode}
              >{TIMESTAMP_LABELS[tsMode]()}</DropdownMenu.RadioItem
            >
          {/each}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>

    <DropdownMenu.Separator />

    <DropdownMenu.Item onSelect={() => onMaximizedChange(!maximized)}>
      {#if maximized}
        <Minimize2 />
        {m.terminal_fullscreen_exit()}
      {:else}
        <Maximize2 />
        {m.terminal_fullscreen_fill()}
      {/if}
    </DropdownMenu.Item>
    <DropdownMenu.Item onSelect={onOpenColors}>
      <Palette />
      {m.terminal_colors_menu()}
    </DropdownMenu.Item>

    <DropdownMenu.Separator />

    <DropdownMenu.Item onSelect={onCopySettings}>
      <Copy />
      {m.terminal_copy_settings()}
    </DropdownMenu.Item>
    <DropdownMenu.Item onSelect={onImportSettings}>
      <ClipboardPaste />
      {m.terminal_import_settings()}
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
