<script lang="ts">
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
    title="Console options"
    aria-label="Console options"
  >
    <Settings2 class="mr-1 h-3.5 w-3.5" />
    Options
  </DropdownMenu.Trigger>
  <DropdownMenu.Content
    align="end"
    class="min-w-48 rounded-sm [&_[data-slot$=item]]:rounded-sm [&_[data-slot$=sub-trigger]]:rounded-sm"
  >
    <DropdownMenu.CheckboxItem
      checked={settings.hideSystem}
      onCheckedChange={(v) => (settings.hideSystem = v)}
    >
      Hide system messages
    </DropdownMenu.CheckboxItem>
    <DropdownMenu.CheckboxItem
      checked={settings.stickToBottom}
      onCheckedChange={onStickToBottomChange}
    >
      Stick to bottom
    </DropdownMenu.CheckboxItem>
    <DropdownMenu.CheckboxItem
      checked={settings.rawMode}
      onCheckedChange={(v) => (settings.rawMode = v)}
    >
      Raw output
    </DropdownMenu.CheckboxItem>

    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>
        Timestamps
        <span class="text-muted-foreground ml-auto text-xs">
          {TIMESTAMP_LABELS[settings.timestampMode]}
        </span>
      </DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent class="rounded-sm [&_[data-slot$=item]]:rounded-sm">
        <DropdownMenu.RadioGroup
          value={settings.timestampMode}
          onValueChange={(v) => (settings.timestampMode = v as TimestampMode)}
        >
          {#each TIMESTAMP_MODES as m (m)}
            <DropdownMenu.RadioItem value={m}>{TIMESTAMP_LABELS[m]}</DropdownMenu.RadioItem>
          {/each}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>

    <DropdownMenu.Separator />

    <DropdownMenu.Item onSelect={() => onMaximizedChange(!maximized)}>
      {#if maximized}
        <Minimize2 />
        Exit fullscreen
      {:else}
        <Maximize2 />
        Fill the window
      {/if}
    </DropdownMenu.Item>
    <DropdownMenu.Item onSelect={onOpenColors}>
      <Palette />
      Colors...
    </DropdownMenu.Item>

    <DropdownMenu.Separator />

    <DropdownMenu.Item onSelect={onCopySettings}>
      <Copy />
      Copy settings
    </DropdownMenu.Item>
    <DropdownMenu.Item onSelect={onImportSettings}>
      <ClipboardPaste />
      Import settings
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
