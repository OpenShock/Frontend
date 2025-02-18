<script lang="ts">
  import { browser } from '$app/environment';
  import { PUBLIC_DISCORD_INVITE_URL } from '$env/static/public';
  import FirmwareFlasher from './FirmwareFlasher.svelte';
  import FirmwareChannelSelector from './FirmwareChannelSelector.svelte';
  import FirmwareBoardSelector from './FirmwareBoardSelector.svelte';
  import FlashManager from '$lib/EspTool/FlashManager';
  import SerialPortSelector from './SerialPortSelector.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { Progress } from '$lib/components/ui/progress';
  import { FlashManagerStore } from '$lib/stores/FlashManagersStore';
  import Bowser from 'bowser';
  import HelpDialog from './HelpDialog.svelte';
  import ChromeLogo from '$lib/components/svg/ChromeLogo.svelte';
  import EdgeLogo from '$lib/components/svg/EdgeLogo.svelte';
  import OperaLogo from '$lib/components/svg/OperaLogo.svelte';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Label } from '$lib/components/ui/label';
  import { Sheet, SheetContent, SheetHeader, SheetTitle } from '$lib/components/ui/sheet';

  import { MessageCircleQuestion, SquareTerminal } from 'lucide-svelte';

  const isSupported = browser && 'serial' in navigator;

  let port = $state<SerialPort | null>(null);
  let manager = $state<FlashManager | null>(null);
  let connectFailed = $state<boolean>(false);
  let isFlashing = $state<boolean>(false);

  let terminalOpen = $state<boolean>(false);
  let terminalText = $state<string>('');

  const terminal = {
    clean: () => {
      terminalText = '';
    },
    writeLine: (data: string) => {
      terminalText += data + '\n';
    },
    write: (data: string) => {
      terminalText += data;
    },
  };

  $effect(() => {
    if (port && !manager) {
      connectFailed = false;
      FlashManagerStore.getManager(port, terminal).then((m) => {
        manager = m;
        if (!manager) {
          connectFailed = true;
        }
      });
    } else if (!port && manager) {
      FlashManagerStore.removeManager(manager);
      manager = null;
    }
  });

  let showHelpDialog = $state(false);

  let version = $state<string | null>(null);
  let board = $state<string | null>(null);
  let eraseBeforeFlash = $state<boolean>(false);
</script>

{#snippet mainContent()}
  <SerialPortSelector bind:port disabled={isFlashing} />

  {#if manager}
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">Select Channel</h3>
    <FirmwareChannelSelector bind:version disabled={isFlashing} />

    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">Select Board</h3>
    <FirmwareBoardSelector {version} bind:selectedBoard={board} disabled={isFlashing} />

    <div class="items-top flex space-x-2">
      <Checkbox id="erase-before-flash" bind:checked={eraseBeforeFlash} />
      <div class="grid gap-1.5 leading-none">
        <Label
          for="erase-before-flash"
          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Erase before flashing
        </Label>
        <p class="text-sm text-muted-foreground">
          Flash tool will erase all data on the device before flashing, in the process clearing any
          existing configs
        </p>
      </div>
    </div>

    {#if version && board}
      <FirmwareFlasher {version} {board} {manager} {eraseBeforeFlash} bind:isFlashing />
    {/if}
  {:else if port && !connectFailed}
    <div class="flex flex-col items-center gap-2">
      <span class="text-center text-2xl"> Connecting... </span>
      <Progress />
      <!-- TODO: Make this a loading animation -->
    </div>
  {/if}

  {#if port && connectFailed}
    <div class="flex flex-col items-start gap-2">
      <span class="bold text-center text-2xl text-red-500"> Device connection failed </span>
      <span class="text-center">
        There was an issue connecting to your device, please try the following:
      </span>
      <ol class="list-decimal pl-6 text-left">
        <li>Install the drivers for your device if you haven't already, using the button above</li>
        <li>Unplug and replug your device</li>
        <li>Use a different USB port</li>
        <li>Use a different USB cable</li>
        <li>
          Contact support if the issue persists:
          <Button href={PUBLIC_DISCORD_INVITE_URL} target="_blank">OpenShock Discord</Button>
        </li>
      </ol>
    </div>
  {/if}
{/snippet}

{#snippet unsupportedBrowser()}
  <h3>Your browser does not support this feature.</h3>
  {#if ['Chrome', 'Edge', 'Opera'].includes(Bowser.getParser(navigator.userAgent).getBrowserName())}
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

<HelpDialog open={showHelpDialog} onClose={() => (showHelpDialog = false)} />

<div class="container my-8">
  <Card.Header class="flex flex-row justify-between">
    <Card.Title class="text-3xl">Flash Tool</Card.Title>
    {#if isSupported}
      <div>
        <Button variant="outline" onclick={() => (terminalOpen = !terminalOpen)}>
          <SquareTerminal />
          Toggle Terminal
        </Button>
        <Button variant="outline" onclick={() => (showHelpDialog = true)}>
          <MessageCircleQuestion />
          I'm having trouble, help?
        </Button>
      </div>
    {/if}
  </Card.Header>
  <Card.Content class="flex flex-col gap-4">
    {#if isSupported}
      {@render mainContent()}
    {:else if browser}
      {@render unsupportedBrowser()}
    {:else}
      Loading...
    {/if}
  </Card.Content>
</div>

<Sheet bind:open={() => terminalOpen, (o) => (terminalOpen = o)}>
  <SheetContent>
    <SheetHeader>
      <SheetTitle class="flex items-center">
        Console
        <div class="flex-1"></div>
        <Button class="m-2" onclick={() => (terminalText = '')}>Clear</Button>
      </SheetTitle>
    </SheetHeader>
    <div
      class="border-surface-500 flex h-max flex-grow flex-col-reverse overflow-auto overflow-y-auto rounded-md border p-4"
    >
      <pre id="terminal" class="text-left text-xs">{terminalText}</pre>
    </div>
  </SheetContent>
</Sheet>
