<script lang="ts">
  import { Check, MessageCircleQuestionMark } from '@lucide/svelte';
  import { browser } from '$app/environment';
  import { PUBLIC_DISCORD_INVITE_URL } from '$env/static/public';
  import type { FirmwareChannel } from '$lib/api/firmwareCDN';
  import FirmwareChannelSelector from '$lib/components/FirmwareChannelSelector.svelte';
  import ChromeLogo from '$lib/components/svg/ChromeLogo.svelte';
  import EdgeLogo from '$lib/components/svg/EdgeLogo.svelte';
  import OperaLogo from '$lib/components/svg/OperaLogo.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Label } from '$lib/components/ui/label';
  import { Progress } from '$lib/components/ui/progress';
  import { useSerial } from '$lib/utils/serial-context.svelte';
  import { getBrowserName, isSerialSupported } from '$lib/utils/compatibility';
  import { parseAnsi, parseLogLine } from './ansi';
  import FirmwareBoardSelector from './FirmwareBoardSelector.svelte';
  import FirmwareFlasher from './FirmwareFlasher.svelte';
  import { useFlashManager } from './flash-context.svelte';
  import HelpDialog from './HelpDialog.svelte';
  import SerialPortSelector from './SerialPortSelector.svelte';
  import SerialTerminal, { type TerminalLine } from './SerialTerminal.svelte';

  const serial = useSerial();

  let port = $state<SerialPort | null>(null);

  const MAX_LINES = 5000;
  let lineIdCounter = 0;
  let terminalLines = $state<TerminalLine[]>([]);

  function makeTerminalLine(text: string, timestamp?: Date): TerminalLine {
    const parsed = parseLogLine(text);
    const message = parsed ? text.substring(parsed.messageOffset) : text;
    return {
      id: lineIdCounter++,
      text,
      timestamp: timestamp ?? new Date(),
      segments: parseAnsi(message),
      logLevel: parsed?.logLevel ?? null,
      deviceUptime: parsed?.deviceUptime ?? null,
      logTag: parsed?.tag ?? null,
    };
  }

  const terminal = {
    clean: () => {
      terminalLines = [];
    },
    writeLine: (data: string) => {
      const newLines = [...terminalLines, makeTerminalLine(data)];
      terminalLines = newLines.length > MAX_LINES ? newLines.slice(-MAX_LINES) : newLines;
    },
    write: (data: string) => {
      if (terminalLines.length > 0) {
        const last = terminalLines[terminalLines.length - 1];
        const newText = last.text + data;
        const parsed = parseLogLine(newText);
        const message = parsed ? newText.substring(parsed.messageOffset) : newText;
        terminalLines = [
          ...terminalLines.slice(0, -1),
          {
            ...last,
            text: newText,
            segments: parseAnsi(message),
            logLevel: parsed?.logLevel ?? null,
            deviceUptime: parsed?.deviceUptime ?? null,
            logTag: parsed?.tag ?? null,
          },
        ];
      } else {
        terminalLines = [makeTerminalLine(data)];
      }
    },
  };

  const flash = useFlashManager(terminal);

  $effect(() => {
    if (port && !flash.manager) {
      flash.connect(port);
    } else if (!port && flash.manager) {
      flash.disconnect();
    }
  });

  let showHelpDialog = $state(false);

  let channel = $state<FirmwareChannel>('stable');
  let version = $state<string | null>(null);
  // Tracks which channel+version the user explicitly confirmed. Changing either invalidates it.
  let confirmedChannel = $state<FirmwareChannel | null>(null);
  let confirmedVersion = $state<string | null>(null);
  let board = $state<string | null>(null);
  let eraseBeforeFlash = $state<boolean>(false);

  // Stepper: derive which step we're on based on state
  // Channel step requires explicit confirmation (both channel and version must match confirmed values)
  let currentStep = $derived(
    !flash.manager
      ? 0
      : !(version && confirmedChannel === channel && confirmedVersion === version)
        ? 1
        : !board
          ? 2
          : 3
  );

  // Allow users to view earlier steps
  let viewStep = $state<number | null>(null);
  let activeStep = $derived(viewStep !== null && viewStep <= currentStep ? viewStep : currentStep);

  function goToStep(step: number) {
    if (step <= currentStep) viewStep = step;
  }
  // Auto-clear viewStep override when currentStep advances past it
  $effect(() => {
    if (viewStep !== null && currentStep > viewStep) viewStep = null;
  });

  const STEPS = [
    { title: 'Connect Device' },
    { title: 'Select Channel' },
    { title: 'Select Board' },
    { title: 'Flash Firmware' },
  ];

  async function handleReset() {
    if (flash.isFlashing) return;
    try {
      flash.isFlashing = true;
      if (!flash.manager) {
        terminal.writeLine('Host-side error during reset: no device!');
        return;
      }
      await flash.manager.ensureApplication(true);
    } catch (e) {
      terminal.writeLine(`Host-side error during reset: ${e}`);
    } finally {
      flash.isFlashing = false;
    }
  }

  async function handleSendCommand(command: string) {
    if (flash.isFlashing) return;
    try {
      flash.isFlashing = true;
      if (!flash.manager) {
        terminal.writeLine("Couldn't send: no device!");
        return;
      }
      await flash.manager.ensureApplication();
      await flash.manager.sendApplicationCommand(command);
    } catch (e) {
      terminal.writeLine(`Couldn't send: ${e}`);
    } finally {
      flash.isFlashing = false;
    }
  }
</script>

<HelpDialog open={showHelpDialog} onClose={() => (showHelpDialog = false)} />

<div class="flex h-full flex-col">
  <!-- Header -->
  <div class="flex items-center justify-between border-b px-6 py-3">
    <h1 class="text-3xl font-bold tracking-tight">Flash Tool</h1>
    {#if isSerialSupported}
      <Button variant="outline" onclick={() => (showHelpDialog = true)}>
        <MessageCircleQuestionMark />
        I'm having trouble, help?
      </Button>
    {/if}
  </div>

  <!-- Main content area (scrollable) -->
  <div class="min-h-0 flex-1 overflow-y-auto px-6 py-4">
    {#if isSerialSupported}
      <div class="max-w-3xl">
        {#each STEPS as step, i (i)}
          {@const isCompleted = i < currentStep}
          {@const isCurrent = i === activeStep}
          {@const isAccessible = i <= currentStep}
          {@const isLast = i === STEPS.length - 1}

          <div class="flex gap-4">
            <!-- Step indicator column -->
            <div class="flex flex-col items-center">
              <!-- Circle -->
              <button
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors
                  {isCompleted
                  ? 'bg-green-500 text-white'
                  : isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : 'border-muted-foreground/30 text-muted-foreground/50 border-2'}"
                disabled={!isAccessible || flash.isFlashing}
                onclick={() => goToStep(i)}
                aria-label="Go to step {i + 1}: {step.title}"
              >
                {#if isCompleted}
                  <Check class="h-4 w-4" />
                {:else}
                  {i + 1}
                {/if}
              </button>
              <!-- Connector line -->
              {#if !isLast}
                <div
                  class="w-0.5 flex-1 {isCompleted ? 'bg-green-500/40' : 'bg-muted-foreground/20'}"
                  style="min-height: 1.5rem;"
                ></div>
              {/if}
            </div>

            <!-- Step content column -->
            <div class="flex-1 pb-6 {!isAccessible ? 'opacity-40' : ''}">
              <!-- Title -->
              <button
                class="mb-2 text-lg font-semibold {isCurrent ? '' : 'text-muted-foreground'}"
                disabled={!isAccessible || flash.isFlashing}
                onclick={() => goToStep(i)}
              >
                {step.title}
              </button>

              <!-- Step 1: Connect Device -->
              {#if i === 0}
                {#if isCurrent}
                  <div class="flex flex-col gap-2">
                    <SerialPortSelector {serial} bind:port disabled={flash.isFlashing} />

                    {#if port && !flash.manager && !flash.connectFailed}
                      <div class="flex flex-col items-center gap-2">
                        <span class="text-center text-lg">Connecting...</span>
                        <Progress />
                      </div>
                    {/if}

                    {#if port && flash.connectFailed}
                      <div class="flex flex-col items-start gap-2">
                        <span class="bold text-lg text-red-500">Device connection failed</span>
                        <span>
                          There was an issue connecting to your device, please try the following:
                        </span>
                        <ol class="list-decimal pl-6 text-left text-sm">
                          <li>Install the drivers for your device</li>
                          <li>Unplug and replug your device</li>
                          <li>Use a different USB port or cable</li>
                          <li>
                            Contact support:
                            <Button
                              href={PUBLIC_DISCORD_INVITE_URL}
                              target="_blank"
                              variant="link"
                              class="h-auto p-0">OpenShock Discord</Button
                            >
                          </li>
                        </ol>
                      </div>
                    {/if}
                  </div>
                {:else if isCompleted}
                  <p class="text-muted-foreground text-sm">Device connected</p>
                {/if}
              {/if}

              <!-- Step 2: Select Channel -->
              {#if i === 1}
                {#if isCurrent}
                  <div class="flex flex-col gap-3">
                    <FirmwareChannelSelector
                      bind:channel
                      bind:version
                      disabled={flash.isFlashing}
                    />
                    {#if version}
                      <Button
                        onclick={() => {
                          confirmedChannel = channel;
                          confirmedVersion = version;
                        }}
                        disabled={flash.isFlashing}
                        class="w-fit"
                      >
                        Continue
                      </Button>
                    {/if}
                  </div>
                {:else if isCompleted}
                  <p class="text-muted-foreground text-sm">
                    <span class="capitalize">{channel}</span> &middot; {version}
                  </p>
                {/if}
              {/if}

              <!-- Step 3: Select Board -->
              {#if i === 2}
                {#if isCurrent}
                  <div class="flex flex-col gap-4">
                    <FirmwareBoardSelector
                      {version}
                      bind:selectedBoard={board}
                      disabled={flash.isFlashing}
                    />

                    <div class="items-top flex space-x-2">
                      <Checkbox id="erase-before-flash" bind:checked={eraseBeforeFlash} />
                      <div class="grid gap-1.5 leading-none">
                        <Label
                          for="erase-before-flash"
                          class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Erase before flashing
                        </Label>
                        <p class="text-muted-foreground text-sm">
                          Clears all data on the device including existing configs
                        </p>
                      </div>
                    </div>
                  </div>
                {:else if isCompleted}
                  <p class="text-muted-foreground text-sm">
                    {board}{eraseBeforeFlash ? ' (erase all)' : ''}
                  </p>
                {/if}
              {/if}

              <!-- Step 4: Flash -->
              {#if i === 3}
                {#if isCurrent && version && board && flash.manager}
                  <FirmwareFlasher
                    {version}
                    {board}
                    {flash}
                    {eraseBeforeFlash}
                    showNonStableWarning={channel !== 'stable'}
                  />
                {/if}
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else if browser}
      {@render unsupportedBrowser()}
    {:else}
      <p>Loading...</p>
    {/if}
  </div>

  <!-- Terminal - persistent bottom panel -->
  {#if port && isSerialSupported}
    <SerialTerminal
      lines={terminalLines}
      manager={flash.manager}
      disabled={flash.isFlashing}
      onClear={() => (terminalLines = [])}
      onReset={handleReset}
      onSendCommand={handleSendCommand}
    />
  {/if}
</div>

{#snippet unsupportedBrowser()}
  <h3>Your browser does not support this feature.</h3>
  {#if ['Chrome', 'Edge', 'Opera'].includes(getBrowserName())}
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">
      Please update your browser to the latest version.
    </h3>
  {:else}
    <h3>Please use one of the following browsers:</h3>
    <div class="flex flex-col gap-2">
      <a class="flex items-center gap-2" href="https://www.google.com/chrome/">
        <ChromeLogo class="h-16" />
        <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">Chrome</h3>
      </a>
      <a class="flex items-center gap-2" href="https://www.microsoft.com/en-us/edge">
        <EdgeLogo class="h-16" />
        <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">Edge</h3>
      </a>
      <a class="flex items-center gap-2" href="https://www.opera.com/">
        <OperaLogo class="h-16" />
        <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">Opera</h3>
      </a>
    </div>
  {/if}
{/snippet}
