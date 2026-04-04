<script lang="ts">
  import {
    Send,
    Trash2,
    RotateCcw,
    Copy,
    Check,
    GripHorizontal,
    Clock,
    Code,
  } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { type AnsiSegment, type LogLevel, LOG_LEVEL_COLORS, stripAnsi } from './ansi';
  import type FlashManager from './FlashManager';
  import { tick } from 'svelte';

  type TimestampMode = 'uptime' | 'local' | 'ms' | 'off';
  const TIMESTAMP_MODES: TimestampMode[] = ['uptime', 'local', 'ms', 'off'];
  const TIMESTAMP_LABELS: Record<TimestampMode, string> = {
    uptime: 'Uptime',
    local: 'Local',
    ms: 'Ms',
    off: 'Off',
  };

  const MAX_LINES = 5000;
  const MIN_HEIGHT = 128;
  const MAX_HEIGHT = 800;
  const DEFAULT_HEIGHT = 256;

  export interface TerminalLine {
    id: number;
    text: string;
    timestamp: Date;
    segments: AnsiSegment[];
    logLevel: LogLevel | null;
    deviceUptime: number | null;
    logTag: string | null;
  }

  interface Props {
    lines: TerminalLine[];
    manager: FlashManager | null;
    disabled?: boolean;
    onClear: () => void;
    onReset: () => void;
    onSendCommand: (command: string) => void;
  }

  let { lines, manager, disabled = false, onClear, onReset, onSendCommand }: Props = $props();

  let commandInput = $state('');
  let commandHistory = $state<string[]>([]);
  let historyIndex = $state(-1);
  let autoScroll = $state(true);
  let scrollContainer = $state<HTMLDivElement | null>(null);

  function handleScroll() {
    if (!scrollContainer) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    autoScroll = scrollTop + clientHeight >= scrollHeight - 16;
  }

  $effect(() => {
    // Depend on lines length to trigger scroll on new content
    const _len = lines.length;
    if (autoScroll && scrollContainer) {
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

  function formatTime(date: Date): string {
    return date.toTimeString().substring(0, 8);
  }

  function formatUptime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const s = totalSeconds % 60;
    const m = Math.floor(totalSeconds / 60) % 60;
    const h = Math.floor(totalSeconds / 3600);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // Visible lines (capped to MAX_LINES from the end)
  let visibleLines = $derived(lines.length > MAX_LINES ? lines.slice(-MAX_LINES) : lines);

  let maxMsWidth = $derived(
    visibleLines.reduce(
      (max, l) => (l.deviceUptime != null ? Math.max(max, String(l.deviceUptime).length) : max),
      0
    )
  );

  let timestampMode = $state<TimestampMode>('uptime');
  let rawMode = $state(false);

  function cycleTimestampMode() {
    const i = TIMESTAMP_MODES.indexOf(timestampMode);
    timestampMode = TIMESTAMP_MODES[(i + 1) % TIMESTAMP_MODES.length];
  }

  function formatTimestamp(line: TerminalLine): string {
    switch (timestampMode) {
      case 'uptime':
        return line.deviceUptime != null ? formatUptime(line.deviceUptime) : '';
      case 'local':
        return formatTime(line.timestamp);
      case 'ms':
        return line.deviceUptime != null
          ? String(line.deviceUptime).padEnd(maxMsWidth, '\u00a0')
          : '';
      case 'off':
        return '';
    }
  }

  let filler = $derived<Record<TimestampMode, string>>({
    uptime: '\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0',
    local: '\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0',
    ms: '\u00a0'.repeat(maxMsWidth),
    off: '',
  });

  let height = $state(DEFAULT_HEIGHT);

  function onResizeStart(e: PointerEvent) {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = height;
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    document.body.style.userSelect = 'none';

    function onMove(e: PointerEvent) {
      height = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight - (e.clientY - startY)));
    }

    function onUp() {
      document.body.style.userSelect = '';
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
    }

    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
  }

  let copied = $state(false);
  let copyTimeout: ReturnType<typeof setTimeout> | undefined;

  async function copyOutput() {
    const text = lines.map((l) => stripAnsi(l.text)).join('\n');
    await navigator.clipboard.writeText(text);
    copied = true;
    clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => (copied = false), 2000);
  }
</script>

<div class="flex flex-col border-t" style="height: {height}px">
  <!-- Resize handle -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="group flex cursor-row-resize items-center justify-center py-0.5 select-none"
    onpointerdown={onResizeStart}
  >
    <GripHorizontal class="text-muted-foreground h-4 w-4 opacity-40 group-hover:opacity-100" />
  </div>
  <!-- Header -->
  <div class="flex items-center justify-between border-b px-4 py-1.5">
    <span class="text-sm font-semibold">Console</span>
    <div class="flex gap-1">
      <Button
        size="sm"
        variant={rawMode ? 'secondary' : 'ghost'}
        onclick={() => (rawMode = !rawMode)}
        title="Toggle raw log output"
      >
        <Code class="mr-1 h-3.5 w-3.5" />
        Raw
      </Button>
      <Button
        size="sm"
        variant={timestampMode !== 'off' ? 'secondary' : 'ghost'}
        onclick={cycleTimestampMode}
        title="Cycle timestamp mode: {TIMESTAMP_LABELS[timestampMode]}"
      >
        <Clock class="mr-1 h-3.5 w-3.5" />
        {TIMESTAMP_LABELS[timestampMode]}
      </Button>
      <Button size="sm" variant="ghost" onclick={copyOutput} disabled={lines.length === 0}>
        {#if copied}
          <Check class="mr-1 h-3.5 w-3.5" />
          Copied
        {:else}
          <Copy class="mr-1 h-3.5 w-3.5" />
          Copy
        {/if}
      </Button>
      <Button size="sm" variant="ghost" onclick={onClear}>
        <Trash2 class="mr-1 h-3.5 w-3.5" />
        Clear
      </Button>
      <Button size="sm" variant="ghost" onclick={onReset} disabled={!manager || disabled}>
        <RotateCcw class="mr-1 h-3.5 w-3.5" />
        Reset
      </Button>
    </div>
  </div>

  <!-- Output area -->
  <div
    class="flex-1 overflow-y-auto bg-black/5 p-2 font-mono text-xs dark:bg-black/30"
    bind:this={scrollContainer}
    onscroll={handleScroll}
    role="log"
    aria-live="polite"
  >
    {#each visibleLines as line (line.id)}
      {#if rawMode}
        <div class="leading-5 break-all whitespace-pre-wrap">{line.text}</div>
      {:else}
        <div class="flex leading-5">
          {#if timestampMode !== 'off'}
            {@const ts = formatTimestamp(line)}
            <span class="text-muted-foreground mr-2 border-r pr-2 opacity-60 select-none"
              >{ts || filler[timestampMode]}</span
            >
          {/if}
          <span
            class="break-all whitespace-pre-wrap"
            style={line.logLevel ? `color:${LOG_LEVEL_COLORS[line.logLevel]}` : ''}
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

  <!-- Command input -->
  <div class="flex items-center gap-2 border-t px-3 py-1.5">
    <span class="text-muted-foreground font-mono text-xs">$</span>
    <input
      class="flex-1 bg-transparent font-mono text-xs outline-none"
      bind:value={commandInput}
      onkeydown={handleKeydown}
      placeholder="Type a command..."
      disabled={!manager || disabled}
    />
    <Button size="sm" variant="ghost" onclick={sendCommand} disabled={!manager || disabled}>
      <Send class="h-3.5 w-3.5" />
    </Button>
  </div>
</div>
