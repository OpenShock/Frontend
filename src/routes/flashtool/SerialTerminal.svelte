<script lang="ts">
  import { Send, Trash2, RotateCcw } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { parseAnsi, type AnsiSegment } from './ansi';
  import type FlashManager from './FlashManager';
  import { tick } from 'svelte';

  const MAX_LINES = 5000;

  export interface TerminalLine {
    text: string;
    timestamp: Date;
    segments: AnsiSegment[];
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
    lines.length;
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

  // Visible lines (capped to MAX_LINES from the end)
  let visibleLines = $derived(lines.length > MAX_LINES ? lines.slice(-MAX_LINES) : lines);
</script>

<div class="flex h-64 flex-col border-t">
  <!-- Header -->
  <div class="flex items-center justify-between border-b px-4 py-1.5">
    <span class="text-sm font-semibold">Console</span>
    <div class="flex gap-1">
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
    {#each visibleLines as line, i (i)}
      <div class="flex leading-5">
        <span class="text-muted-foreground mr-2 select-none opacity-60">{formatTime(line.timestamp)}</span>
        <span class="whitespace-pre-wrap break-all">
          {#each line.segments as seg}
            {#if Object.keys(seg.style).length > 0}
              <span
                style={Object.entries(seg.style)
                  .map(([k, v]) => `${k}:${v}`)
                  .join(';')}>{seg.text}</span>
            {:else}
              {seg.text}
            {/if}
          {/each}
        </span>
      </div>
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
