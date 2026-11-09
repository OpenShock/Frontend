<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import {
    ArrowLeft,
    Check,
    MessageCircleQuestionMark,
    Settings2,
    Terminal,
    Unplug,
    Zap,
  } from '@lucide/svelte';
  import { browser } from '$app/env';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { untrack } from 'svelte';
  import type { FirmwareChannel } from '#lib/api/firmwareCDN.js';
  import { Container } from '@openshock/svelte-core/components';
  import FirmwareChannelSelector from '#lib/components/FirmwareChannelSelector.svelte';
  import { ChromeLogo, EdgeLogo, OperaLogo } from '@openshock/svelte-core/components/svg';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { Checkbox } from '@openshock/svelte-core/components/ui/checkbox';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { Label } from '@openshock/svelte-core/components/ui/label';
  import { Progress } from '@openshock/svelte-core/components/ui/progress';
  import { getHardwareId, useSerial } from '#lib/utils/serial-context.svelte.js';
  import { getBrowserName } from '#lib/utils/compatibility.js';
  import DeviceConfigurator from './DeviceConfigurator.svelte';
  import FirmwareBoardSelector from './FirmwareBoardSelector.svelte';
  import FirmwareFlasher from './FirmwareFlasher.svelte';
  import HelpDialog from './HelpDialog.svelte';
  import ModePicker from './ModePicker.svelte';
  import { isMode, type Mode } from './modes';
  import SerialPortSelector from './SerialPortSelector.svelte';
  import SerialTerminal from './SerialTerminal.svelte';
  import EspSerialConnection from './EspSerialConnection';
  import { TerminalContext } from './TerminalContext.svelte';

  const serial = useSerial();

  const MODE_PARAM = 'mode';
  const FULLSCREEN_PARAM = 'fullscreen';

  type UrlLike = { searchParams: { get(name: string): string | null } };

  function modeFromUrl(url: UrlLike): Mode | null {
    const value = url.searchParams.get(MODE_PARAM);
    return isMode(value) ? value : null;
  }

  function fullscreenFromUrl(url: UrlLike): boolean {
    return url.searchParams.get(FULLSCREEN_PARAM) === '1';
  }

  let mode = $state<Mode | null>(modeFromUrl(page.url));
  let fullscreen = $state(fullscreenFromUrl(page.url));
  let port = $state<SerialPort | null>(null);
  const terminal = new TerminalContext();

  let connection = $state<EspSerialConnection | null>(null);
  let isFlashing = $state<boolean>(false);
  let connectFailed = $state<boolean>(false);

  let showHelpDialog = $state(false);

  let channel = $state<FirmwareChannel>('stable');
  let version = $state<string | null>(null);
  // Tracks which channel+version the user explicitly confirmed. Changing either invalidates it.
  let confirmedChannel = $state<FirmwareChannel | null>(null);
  let confirmedVersion = $state<string | null>(null);
  let board = $state<string | null>(null);
  let eraseBeforeFlash = $state<boolean>(false);

  let viewStep = $state<number | null>(null);

  // Monitor mode hides the page chrome once connected; the console header takes over.
  let terminalOnly = $derived(mode === 'raw' && connection !== null);

  /** Writes the current mode and fullscreen state to the address bar. */
  function syncUrl(replace: boolean) {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- built once, never observed
    const params = new URLSearchParams();
    if (mode) params.set(MODE_PARAM, mode);
    if (fullscreen) params.set(FULLSCREEN_PARAM, '1');
    const query = params.toString();
    if (query === page.url.search.slice(1)) return;
    const target = query ? `${resolve('terminal')}?${query}` : resolve('terminal');
    // eslint-disable-next-line svelte/no-navigation-without-resolve -- resolved path plus query string
    void goto(target, { replace, reset: false });
  }

  function selectMode(m: Mode) {
    mode = m;
    syncUrl(false);
  }

  function resetModeState() {
    port = null;
    connectFailed = false;
    confirmedChannel = null;
    confirmedVersion = null;
    board = null;
    viewStep = null;
  }

  // Back/forward navigation and pasted links drive state from the URL.
  $effect(() => {
    const urlMode = modeFromUrl(page.url);
    const urlFullscreen = fullscreenFromUrl(page.url);
    untrack(() => {
      if (urlMode !== mode) {
        resetModeState();
        mode = urlMode;
      }
      if (urlFullscreen !== fullscreen) {
        fullscreen = urlFullscreen;
      }
    });
  });

  // Fullscreen toggles come from the console panel; mirror them without adding history entries.
  $effect(() => {
    void fullscreen;
    untrack(() => syncUrl(true));
  });

  $effect(() => {
    if (port && !connection && mode) {
      connectFailed = false;
      const attemptedPort = port;
      const connect =
        mode === 'flash'
          ? EspSerialConnection.ConnectBootloader
          : EspSerialConnection.ConnectApplication;
      connect(attemptedPort, terminal)
        .then((conn) => (connection = conn))
        .catch(() => {
          connectFailed = true;
          // Reset the port so the SerialPortSelector returns to "Select Device".
          // Only clear it if the user hasn't already picked a different port in the meantime.
          if (port === attemptedPort) port = null;
        });
    } else if (!port && connection) {
      connection.disconnect();
      connection = null;
    }
  });

  function changeMode() {
    resetModeState();
    mode = null;
    fullscreen = false;
    syncUrl(false);
  }

  // Stepper: derive which step we're on based on state
  // Channel step requires explicit confirmation (both channel and version must match confirmed values)
  let currentStep = $derived(
    !(version && confirmedChannel === channel && confirmedVersion === version) ? 0 : !board ? 1 : 2
  );

  // Allow users to view earlier steps
  let activeStep = $derived(viewStep !== null && viewStep <= currentStep ? viewStep : currentStep);

  function goToStep(step: number) {
    if (step <= currentStep) viewStep = step;
  }
  // Auto-clear viewStep override when currentStep advances past it
  $effect(() => {
    if (viewStep !== null && currentStep > viewStep) viewStep = null;
  });

  const STEPS = [
    { title: m.terminal_step_channel() },
    { title: m.terminal_step_board() },
    { title: m.terminal_mode_flash() },
  ];

  async function handleReset() {
    if (isFlashing) return;
    try {
      isFlashing = true;
      if (!connection) {
        terminal.writeLine(m.terminal_log_reset_no_device());
        return;
      }
      await connection.ensureApplication(true);
    } catch (e) {
      terminal.writeLine(m.terminal_log_reset_error({ error: String(e) }));
    } finally {
      isFlashing = false;
    }
  }

  async function handleSendCommand(command: string) {
    if (isFlashing) return;
    try {
      isFlashing = true;
      if (!connection) {
        terminal.writeLine(m.terminal_log_send_no_device());
        return;
      }
      await connection.ensureApplication();
      await connection.sendApplicationCommand(command);
    } catch (e) {
      terminal.writeLine(m.terminal_log_send_error({ error: String(e) }));
    } finally {
      isFlashing = false;
    }
  }

  function handleFlashComplete() {
    // Keep port/connection (device is now in application mode) and switch to configuration.
    viewStep = null;
    mode = 'configure';
    syncUrl(true);
  }
</script>

<HelpDialog open={showHelpDialog} onClose={() => (showHelpDialog = false)} />

<Dialog.Root bind:open={connectFailed}>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <div class="flex items-start gap-3">
        <div
          class="bg-destructive/10 text-destructive flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        >
          <Unplug class="h-5 w-5" />
        </div>
        <div class="flex flex-1 flex-col gap-1">
          <Dialog.Title class="text-left">
            {mode === 'flash'
              ? m.terminal_connect_failed_bootloader()
              : m.terminal_connect_failed()}
          </Dialog.Title>
          <Dialog.Description class="text-left">
            {m.terminal_connect_failed_desc()}
          </Dialog.Description>
        </div>
      </div>
    </Dialog.Header>
    <div class="flex flex-col gap-2 py-2">
      <p class="text-muted-foreground text-sm">{m.terminal_quick_tries()}</p>
      <ul class="text-muted-foreground ml-1 flex flex-col gap-1.5 text-sm">
        <li class="flex items-start gap-2">
          <span class="bg-muted-foreground/40 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"></span>
          {m.terminal_try_replug()}
        </li>
        <li class="flex items-start gap-2">
          <span class="bg-muted-foreground/40 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"></span>
          {m.terminal_try_cable()}
        </li>
        <li class="flex items-start gap-2">
          <span class="bg-muted-foreground/40 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"></span>
          {m.terminal_try_driver()}
        </li>
      </ul>
    </div>
    <Dialog.Footer class="gap-2 sm:gap-2">
      <Button variant="outline" onclick={() => (connectFailed = false)}>{m.common_close()}</Button>
      <Button
        onclick={() => {
          connectFailed = false;
          showHelpDialog = true;
        }}
      >
        <MessageCircleQuestionMark class="h-4 w-4" />
        {m.terminal_open_troubleshooter()}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<div class="flex h-full min-h-0 flex-col">
  {#if !terminalOnly}
    <div class="min-h-0 flex-1 overflow-y-auto">
      <Container>
        <Card.Header class="w-full">
          <Card.Title class="flex items-center justify-between gap-2 text-3xl">
            <h1>{m.terminal_title()}</h1>
            {#if serial}
              <Button variant="outline" onclick={() => (showHelpDialog = true)}>
                <MessageCircleQuestionMark />
                {m.terminal_help_button()}
              </Button>
            {/if}
          </Card.Title>
        </Card.Header>

        {#if serial}
          {#snippet portConnectionBlock()}
            <div class="flex flex-col gap-2">
              <SerialPortSelector {serial} bind:port disabled={isFlashing} />

              {#if port && !connection && !connectFailed}
                <div class="flex flex-col items-center gap-2">
                  <span class="text-center text-lg">{m.live_tooltip_connecting()}</span>
                  <Progress />
                </div>
              {/if}
            </div>
          {/snippet}

          {#if !mode}
            <ModePicker onSelect={selectMode} />
          {:else}
            <!-- Mode indicator + back button -->
            <div class="text-muted-foreground flex w-full items-center gap-2 text-sm">
              <Button
                variant="ghost"
                size="sm"
                onclick={changeMode}
                disabled={isFlashing}
                class="h-auto gap-1 p-1"
              >
                <ArrowLeft class="h-3.5 w-3.5" />
                {m.terminal_back_to_modes()}
              </Button>
              <span>&middot;</span>
              {#if mode === 'configure'}
                <Settings2 class="h-3.5 w-3.5" />
                <span>{m.terminal_mode_configure()}</span>
              {:else if mode === 'raw'}
                <Terminal class="h-3.5 w-3.5" />
                <span>{m.terminal_mode_raw()}</span>
              {:else}
                <Zap class="h-3.5 w-3.5" />
                <span>{m.terminal_mode_flash()}</span>
              {/if}
            </div>

            <div class="flex w-full flex-col gap-4">
              {@render portConnectionBlock()}

              {#if connection}
                {#if mode === 'configure'}
                  <DeviceConfigurator
                    {terminal}
                    disabled={isFlashing}
                    onSendCommand={handleSendCommand}
                  />
                {:else if mode === 'flash'}
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
                            ? 'bg-success text-success-foreground'
                            : isCurrent
                              ? 'bg-primary text-primary-foreground'
                              : 'border-muted-foreground/30 text-muted-foreground/50 border-2'}"
                          disabled={!isAccessible || isFlashing}
                          onclick={() => goToStep(i)}
                          aria-label={m.terminal_go_to_step({ number: i + 1, title: step.title })}
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
                            class="w-0.5 flex-1 {isCompleted
                              ? 'bg-success/40'
                              : 'bg-muted-foreground/20'}"
                            style="min-height: 1.5rem;"
                          ></div>
                        {/if}
                      </div>

                      <!-- Step content column -->
                      <div class="flex-1 pb-6 {!isAccessible ? 'opacity-40' : ''}">
                        <!-- Title -->
                        <button
                          class="mb-2 text-lg font-semibold {isCurrent
                            ? ''
                            : 'text-muted-foreground'}"
                          disabled={!isAccessible || isFlashing}
                          onclick={() => goToStep(i)}
                        >
                          {step.title}
                        </button>

                        <!-- Step 1: Select Channel -->
                        {#if i === 0}
                          {#if isCurrent}
                            <div class="flex flex-col gap-3">
                              <FirmwareChannelSelector
                                bind:channel
                                bind:version
                                disabled={isFlashing}
                              />
                              {#if version}
                                <Button
                                  onclick={() => {
                                    confirmedChannel = channel;
                                    confirmedVersion = version;
                                  }}
                                  disabled={isFlashing}
                                  class="w-fit"
                                >
                                  {m.common_continue()}
                                </Button>
                              {/if}
                            </div>
                          {:else if isCompleted}
                            <p class="text-muted-foreground text-sm">
                              <span class="capitalize">{channel}</span> &middot; {version}
                            </p>
                          {/if}
                        {/if}

                        <!-- Step 2: Select Board -->
                        {#if i === 1}
                          {#if isCurrent}
                            <div class="flex flex-col gap-4">
                              <FirmwareBoardSelector
                                {version}
                                bind:selectedBoard={board}
                                disabled={isFlashing}
                              />

                              <div class="flex items-start gap-2">
                                <Checkbox id="erase-before-flash" bind:checked={eraseBeforeFlash} />
                                <div class="grid gap-1.5 leading-none">
                                  <Label
                                    for="erase-before-flash"
                                    class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {m.terminal_erase()}
                                  </Label>
                                  <p class="text-muted-foreground text-sm">
                                    {m.terminal_erase_desc()}
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

                        <!-- Step 3: Flash -->
                        {#if i === 2}
                          {#if isCurrent && version && board && connection}
                            <FirmwareFlasher
                              {version}
                              {board}
                              {connection}
                              {eraseBeforeFlash}
                              showNonStableWarning={channel !== 'stable'}
                              bind:isFlashing
                              onComplete={handleFlashComplete}
                            />
                          {/if}
                        {/if}
                      </div>
                    </div>
                  {/each}
                {/if}
              {/if}
            </div>
          {/if}
        {:else if browser}
          {@render unsupportedBrowser()}
        {:else}
          <p>{m.common_loading()}</p>
        {/if}
      </Container>
    </div>
  {/if}

  {#if connection && mode}
    <SerialTerminal
      context={terminal}
      {mode}
      fill={terminalOnly}
      deviceLabel={terminalOnly ? getHardwareId(port) : null}
      onDisconnect={terminalOnly ? changeMode : null}
      bind:maximized={fullscreen}
      disabled={isFlashing}
      onReset={handleReset}
      onSendCommand={handleSendCommand}
    />
  {/if}
</div>

{#snippet unsupportedBrowser()}
  <h3>{m.terminal_unsupported()}</h3>
  {#if ['Chrome', 'Edge', 'Opera'].includes(getBrowserName())}
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">
      {m.terminal_update_browser()}
    </h3>
  {:else}
    <h3>{m.terminal_use_browsers()}</h3>
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
