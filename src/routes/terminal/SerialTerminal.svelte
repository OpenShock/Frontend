<script lang="ts">
  import {
    Send,
    Trash2,
    RotateCcw,
    Copy,
    Check,
    GripHorizontal,
    Unplug,
    X,
    GripVertical,
    Maximize2,
    Minimize2,
  } from '@lucide/svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import { Separator } from '@openshock/svelte-core/components/ui/separator';
  import { copyToClipboard, useClipboard } from '@openshock/svelte-core/utils';
  import { formatClockDuration, formatLocalTime } from '#lib/utils/datetime.js';
  import { trackPointerDrag } from '#lib/utils/pointer-drag.js';
  import { stripAnsi } from './ansi';
  import type { TerminalLine, TimestampMode } from './types';
  import type { TerminalContext } from './TerminalContext.svelte';
  import { TerminalSettings } from './terminal-settings.svelte';
  import { COLOR_KEYS, COLOR_LABELS } from './constants';
  import { tick, onDestroy, onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { toast } from 'svelte-sonner';
  import ConsoleContextMenu from './ConsoleContextMenu.svelte';
  import ConsoleOptionsMenu from './ConsoleOptionsMenu.svelte';

  const PANEL_MIN_HEIGHT = 128;
  const PANEL_MAX_HEIGHT = 800;
  const PANEL_DEFAULT_HEIGHT = 256;
  // How close to the bottom, in pixels, still counts as "at the bottom" for auto-scroll.
  const SCROLL_BOTTOM_THRESHOLD = 16;
  const MAXIMIZE_DURATION_MS = 260;
  const MAXIMIZE_EASING = 'cubic-bezier(0.2, 0, 0, 1)';
  const COLORS_PANEL_FADE_MS = 120;

  interface Props {
    context: TerminalContext;
    mode: 'flash' | 'configure' | 'raw';
    /** Fill the remaining height of the parent instead of using a resizable fixed height. */
    fill?: boolean;
    /** Shown next to the console title, e.g. the device's hardware ID. */
    deviceLabel?: string | null;
    /** When set, a disconnect button is shown in the header. */
    onDisconnect?: (() => void) | null;
    disabled?: boolean;
    /** Whether the console covers the whole window. Bindable so the page can mirror it in the URL. */
    maximized?: boolean;
    onReset: () => void;
    onSendCommand: (command: string) => void;
  }

  let {
    context,
    mode,
    fill = false,
    deviceLabel = null,
    onDisconnect = null,
    disabled = false,
    maximized = $bindable(false),
    onReset,
    onSendCommand,
  }: Props = $props();

  const settings = new TerminalSettings();
  $effect(() => settings.save());

  // Follow the site theme so the default palette matches it. User overrides apply to both.
  let isDark = $state(true);
  onMount(() => {
    const root = document.documentElement;
    const update = () => (isDark = root.classList.contains('dark'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  });

  let palette = $derived(settings.effectivePalette(isDark));
  let paletteStyle = $derived(
    COLOR_KEYS.map((k) => `--term-${k}:${palette[k]}`).join(';') +
      ';background:var(--term-bg);color:var(--term-fg)'
  );

  let lines = $derived(
    settings.hideSystem ? context.lines.filter((l) => l.logFormat !== 'espidf') : context.lines
  );

  let hasInput = $derived(mode === 'configure' || mode === 'raw');

  let rootEl = $state<HTMLDivElement | null>(null);
  let colorsOpen = $state(false);

  // While animating, the panel is taken out of flow and a placeholder keeps the page layout still.
  let animatingFixed = $state(false);
  let placeholderHeight = $state<number | null>(null);
  let isFixed = $derived(maximized || animatingFixed);
  let maximizeAnimation: Animation | null = null;

  function rectKeyframe(r: { top: number; left: number; width: number; height: number }) {
    return {
      top: `${r.top}px`,
      left: `${r.left}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
    };
  }

  function viewportRect() {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  }

  async function setMaximized(value: boolean) {
    if (value === maximized) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!rootEl || reduceMotion) {
      maximized = value;
      return;
    }

    maximizeAnimation?.cancel();
    const from = value ? rootEl.getBoundingClientRect() : viewportRect();

    // Switch layout, then measure where the panel ends up. Both happen before the next paint.
    animatingFixed = false;
    placeholderHeight = null;
    maximized = value;
    await tick();
    const to = value ? viewportRect() : rootEl.getBoundingClientRect();

    // Pin the panel for the duration and hold its in-flow space with a placeholder.
    placeholderHeight = value ? from.height : to.height;
    animatingFixed = true;
    await tick();

    maximizeAnimation = rootEl.animate([rectKeyframe(from), rectKeyframe(to)], {
      duration: MAXIMIZE_DURATION_MS,
      easing: MAXIMIZE_EASING,
    });
    const finished = maximizeAnimation;
    try {
      await finished.finished;
    } catch {
      // Cancelled by a newer toggle; that call cleans up.
      return;
    }
    if (maximizeAnimation === finished) {
      maximizeAnimation = null;
      animatingFixed = false;
      placeholderHeight = null;
    }
  }

  onDestroy(() => maximizeAnimation?.cancel());

  function handleWindowKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && maximized) {
      setMaximized(false);
    }
  }

  // Clicking anywhere in the console focuses the command input, unless the user is selecting text.
  function focusInput(e: MouseEvent) {
    if (!commandInputEl || disabled) return;
    // Leave clicks on controls alone, e.g. the color pickers in the floating panel.
    const target = e.target as HTMLElement | null;
    if (target?.closest('input, button, select, textarea, a, label, [role="dialog"]')) return;
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) return;
    commandInputEl.focus();
  }

  $effect(() => {
    if (hasInput && !disabled) {
      tick().then(() => commandInputEl?.focus());
    }
  });

  let commandInput = $state('');
  let commandHistory = $state<string[]>([]);
  let historyIndex = $state(-1);
  let nearBottom = $state(true);
  let scrollContainer = $state<HTMLDivElement | null>(null);
  let commandInputEl = $state<HTMLInputElement | null>(null);

  function handleScroll() {
    if (!scrollContainer) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    nearBottom = scrollTop + clientHeight >= scrollHeight - SCROLL_BOTTOM_THRESHOLD;
  }

  function setStickToBottom(value: boolean) {
    settings.stickToBottom = value;
    if (value && scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }

  $effect(() => {
    // Depend on lines length to trigger scroll on new content
    const _len = lines.length;
    if ((settings.stickToBottom || nearBottom) && scrollContainer) {
      tick().then(() => {
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      });
    }
  });

  function sendCommand() {
    const cmd = commandInput.trim();
    if (!cmd) return;
    commandHistory = [...commandHistory, cmd];
    historyIndex = -1;
    onSendCommand(cmd);
    commandInput = '';
    // Refocus after tick so disabled round-trip doesn't steal focus
    tick().then(() => commandInputEl?.focus());
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      if (historyIndex === -1) {
        historyIndex = commandHistory.length - 1;
      } else if (historyIndex > 0) {
        historyIndex--;
      }
      commandInput = commandHistory[historyIndex];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        commandInput = commandHistory[historyIndex];
      } else {
        historyIndex = -1;
        commandInput = '';
      }
    }
  }

  let maxMsWidth = $derived(
    lines.reduce(
      (max, l) => (l.deviceUptime != null ? Math.max(max, String(l.deviceUptime).length) : max),
      0
    )
  );

  function formatTimestamp(line: TerminalLine): string {
    switch (settings.timestampMode) {
      case 'uptime':
        return line.deviceUptime != null ? formatClockDuration(line.deviceUptime) : '';
      case 'local':
        return formatLocalTime(line.timestamp);
      case 'ms':
        return line.deviceUptime != null
          ? String(line.deviceUptime).padEnd(maxMsWidth, '\u00a0')
          : '';
      case 'off':
        return '';
    }
  }

  let filler = $derived<Record<TimestampMode, string>>({
    uptime: '\u00a0'.repeat(8),
    local: '\u00a0'.repeat(8),
    ms: '\u00a0'.repeat(maxMsWidth),
    off: '',
  });

  let height = $state(PANEL_DEFAULT_HEIGHT);

  // Floating colors panel. Position is relative to the console; null means centered.
  let colorsPos = $state<{ x: number; y: number } | null>(null);
  let colorsPanelEl = $state<HTMLDivElement | null>(null);

  function clampColorsPos(x: number, y: number) {
    if (!rootEl || !colorsPanelEl) return { x, y };
    const maxX = Math.max(0, rootEl.clientWidth - colorsPanelEl.offsetWidth);
    const maxY = Math.max(0, rootEl.clientHeight - colorsPanelEl.offsetHeight);
    return { x: Math.min(maxX, Math.max(0, x)), y: Math.min(maxY, Math.max(0, y)) };
  }

  function onColorsDragStart(e: PointerEvent) {
    if (!rootEl || !colorsPanelEl) return;
    const rootRect = rootEl.getBoundingClientRect();
    const panelRect = colorsPanelEl.getBoundingClientRect();
    const offsetX = e.clientX - panelRect.left;
    const offsetY = e.clientY - panelRect.top;
    trackPointerDrag(e, (move) => {
      colorsPos = clampColorsPos(
        move.clientX - rootRect.left - offsetX,
        move.clientY - rootRect.top - offsetY
      );
    });
  }

  function onResizeStart(e: PointerEvent) {
    const startY = e.clientY;
    const startHeight = height;
    trackPointerDrag(e, (move) => {
      height = Math.min(
        PANEL_MAX_HEIGHT,
        Math.max(PANEL_MIN_HEIGHT, startHeight - (move.clientY - startY))
      );
    });
  }

  const clipboard = useClipboard();

  function copySettings() {
    void copyToClipboard(settings.exportString(), 'Console settings copied');
  }

  async function importSettings() {
    let text: string;
    try {
      text = await navigator.clipboard.readText();
    } catch {
      toast.error('Could not read the clipboard');
      return;
    }
    if (settings.importString(text)) {
      toast.success('Console settings imported');
    } else {
      toast.error('Clipboard does not contain console settings');
    }
  }

  function copyOutput() {
    void clipboard.copy(lines.map((l) => stripAnsi(l.text)).join('\n'), 'Console output copied');
  }
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#if placeholderHeight !== null}
  <div class="shrink-0" style="height: {placeholderHeight}px"></div>
{/if}

<ConsoleContextMenu
  {settings}
  {maximized}
  onMaximizedChange={setMaximized}
  onStickToBottomChange={setStickToBottom}
  onCopyOutput={copyOutput}
  onOpenColors={() => (colorsOpen = true)}
>
  {#snippet children({ props })}
    <div
      {...props}
      bind:this={rootEl}
      class="bg-background flex w-full flex-col border-t {isFixed
        ? 'fixed inset-0 z-50 overflow-hidden'
        : fill
          ? 'relative min-h-0 flex-1'
          : 'relative'}"
      style="{props.style ?? ''};{fill || isFixed ? '' : `height: ${height}px`}"
      onclick={focusInput}
    >
      <!-- Resize handle -->
      {#if !fill && !isFixed}
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize terminal panel"
          tabindex="0"
          class="group flex cursor-row-resize items-center justify-center py-0.5 select-none"
          onpointerdown={onResizeStart}
        >
          <GripHorizontal
            class="text-muted-foreground h-4 w-4 opacity-40 group-hover:opacity-100"
          />
        </div>
      {/if}
      <!-- Header -->
      <div class="flex items-center justify-between border-b px-4 py-1.5">
        <div class="flex min-w-0 items-center gap-4">
          <span class="text-sm font-semibold">Console</span>
          {#if deviceLabel}
            <code
              class="bg-muted text-muted-foreground truncate rounded border px-1.5 py-0.5 font-mono text-[11px] leading-none"
              title="Connected device"
            >
              {deviceLabel}
            </code>
          {/if}
        </div>
        <div class="flex items-center gap-1">
          <!-- Console controls -->
          <Button size="sm" variant="ghost" onclick={copyOutput} disabled={lines.length === 0}>
            {#if clipboard.copied}
              <Check class="mr-1 h-3.5 w-3.5" />
              Copied
            {:else}
              <Copy class="mr-1 h-3.5 w-3.5" />
              Copy
            {/if}
          </Button>
          <Button size="sm" variant="ghost" onclick={context.clean}>
            <Trash2 class="mr-1 h-3.5 w-3.5" />
            Clear
          </Button>
          <ConsoleOptionsMenu
            {settings}
            {maximized}
            onMaximizedChange={setMaximized}
            onStickToBottomChange={setStickToBottom}
            onOpenColors={() => (colorsOpen = true)}
            onCopySettings={copySettings}
            onImportSettings={importSettings}
          />

          <!-- Device controls -->
          {#if hasInput || onDisconnect}
            <Separator orientation="vertical" class="mx-1 my-1" />
          {/if}
          {#if hasInput}
            <Button size="sm" variant="ghost" onclick={onReset} {disabled}>
              <RotateCcw class="mr-1 h-3.5 w-3.5" />
              Reboot
            </Button>
          {/if}
          {#if onDisconnect}
            <Button
              size="sm"
              variant="ghost"
              class="text-destructive hover:text-destructive"
              onclick={onDisconnect}
              {disabled}
            >
              <Unplug class="mr-1 h-3.5 w-3.5" />
              Disconnect
            </Button>
          {/if}

          <!-- Window -->
          <Separator orientation="vertical" class="mx-1 my-1" />
          <Button
            size="sm"
            variant="ghost"
            onclick={() => setMaximized(!maximized)}
            title={maximized ? 'Exit fullscreen (Esc)' : 'Fill the window'}
            aria-label={maximized ? 'Exit fullscreen' : 'Fill the window'}
          >
            {#if maximized}
              <Minimize2 class="h-3.5 w-3.5" />
            {:else}
              <Maximize2 class="h-3.5 w-3.5" />
            {/if}
          </Button>
        </div>
      </div>

      <div class="flex min-h-0 flex-1">
        <div class="flex min-w-0 flex-1 flex-col">
          <!-- Output area -->
          <div
            class="flex-1 overflow-y-auto p-2 font-mono text-xs"
            style={paletteStyle}
            bind:this={scrollContainer}
            onscroll={handleScroll}
            role="log"
            aria-live="polite"
          >
            {#each lines as line (line.id)}
              {#if settings.rawMode}
                <div class="leading-5 break-all whitespace-pre-wrap">{line.text}</div>
              {:else}
                <div class="flex leading-5">
                  {#if settings.timestampMode !== 'off'}
                    {@const ts = formatTimestamp(line)}
                    <span
                      class="mr-2 border-r pr-2 select-none"
                      style="color:var(--term-ts);border-color:color-mix(in srgb, var(--term-ts) 40%, transparent)"
                      >{ts || filler[settings.timestampMode]}</span
                    >
                  {/if}
                  <span
                    class="break-all whitespace-pre-wrap"
                    style={line.logLevel ? `color:var(--term-${line.logLevel})` : ''}
                  >
                    {#each line.segments as seg, j (j)}
                      {#if Object.keys(seg.style).length > 0}
                        <span
                          style={Object.entries(seg.style)
                            .map(([k, v]) => `${k}:${v}`)
                            .join(';')}>{seg.text}</span
                        >
                      {:else}
                        {seg.text}
                      {/if}
                    {/each}
                  </span>
                </div>
              {/if}
            {/each}
          </div>

          <!-- Command input (flash mode is read-only) -->
          {#if hasInput}
            <div class="flex items-center gap-2 border-t px-3 py-1.5" style={paletteStyle}>
              <span class="font-mono text-xs" style="color:var(--term-ts)">$</span>
              <input
                class="flex-1 bg-transparent font-mono text-xs outline-none placeholder:opacity-50"
                bind:this={commandInputEl}
                bind:value={commandInput}
                onkeydown={handleKeydown}
                aria-label="Serial command"
                placeholder="Type a command..."
                {disabled}
              />
              <Button
                size="sm"
                variant="ghost"
                onclick={sendCommand}
                {disabled}
                title="Send command"
                aria-label="Send command"
              >
                <Send class="h-3.5 w-3.5" />
              </Button>
            </div>
          {/if}
        </div>

        <!-- Floating colors panel. Lives inside the console so changes preview live. -->
        {#if colorsOpen}
          <div
            bind:this={colorsPanelEl}
            class="bg-popover text-popover-foreground ring-foreground/10 absolute z-10 flex w-72 flex-col gap-3 rounded-sm p-3 shadow-lg ring-1"
            style={colorsPos
              ? `left: ${colorsPos.x}px; top: ${colorsPos.y}px`
              : 'left: 50%; top: 50%; transform: translate(-50%, -50%)'}
            transition:fade={{ duration: COLORS_PANEL_FADE_MS }}
            role="dialog"
            aria-label="Console colors"
          >
            <div class="flex items-center justify-between">
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div
                class="flex flex-1 cursor-move items-center gap-1 select-none"
                onpointerdown={onColorsDragStart}
              >
                <GripVertical class="text-muted-foreground h-3.5 w-3.5" />
                <p class="text-sm font-semibold">Colors</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                class="h-auto p-1"
                onclick={() => (colorsOpen = false)}
                aria-label="Close colors"
              >
                <X class="h-3.5 w-3.5" />
              </Button>
            </div>
            <div class="grid grid-cols-2 gap-1.5">
              {#each COLOR_KEYS as key (key)}
                <label
                  class="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm"
                >
                  <span
                    class="ring-foreground/20 h-5 w-5 shrink-0 rounded-sm ring-1 ring-inset"
                    style="background: {palette[key]}"
                  ></span>
                  <span class="truncate">{COLOR_LABELS[key]}</span>
                  <input
                    type="color"
                    class="sr-only"
                    value={palette[key]}
                    oninput={(e) => settings.setColor(key, e.currentTarget.value)}
                    aria-label="{COLOR_LABELS[key]} color"
                  />
                </label>
              {/each}
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={!settings.hasCustomColors}
              onclick={() => settings.resetColors()}
            >
              <RotateCcw class="h-3.5 w-3.5" />
              Reset to defaults
            </Button>
          </div>
        {/if}
      </div>
    </div>
  {/snippet}
</ConsoleContextMenu>
