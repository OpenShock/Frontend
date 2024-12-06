<script lang="ts">
  import { PUBLIC_DISCORD_INVITE_URL } from '$env/static/public';
  import FirmwareFlasher from './FirmwareFlasher.svelte';
  import FirmwareSelector from './FirmwareSelector.svelte';
  import FlashManager from '$lib/EspTool/FlashManager';
  import SerialPortSelector from './SerialPortSelector.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { Progress } from '$lib/components/ui/progress';
  import { FlashManagerStore } from '$lib/stores/FlashManagersStore';
  import HelpDialog from './HelpDialog.svelte';

  import { MessageCircleQuestion, SquareTerminal } from 'lucide-svelte';

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
</script>

<HelpDialog open={showHelpDialog} onClose={() => (showHelpDialog = false)} />

<div class="container my-8">
  <Card.Header class="flex flex-row justify-between">
    <Card.Title class="text-3xl">Flash Tool</Card.Title>
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
  </Card.Header>
  <Card.Content>
    <SerialPortSelector bind:port disabled={isFlashing} />
    {#if port}
      {#if manager}
        <FirmwareSelector bind:version bind:selectedBoard={board} disabled={isFlashing} />
        {#if version && board && manager}
          <FirmwareFlasher {version} {board} {manager} bind:isFlashing />
        {/if}
      {:else if !connectFailed}
        <div class="flex flex-col items-center gap-2">
          <span class="text-2xl text-center"> Connecting... </span>
          <Progress />
          <!-- TODO: Make this a loading animation -->
        </div>
      {/if}
    {/if}
    {#if connectFailed}
      <div class="flex flex-col items-start gap-2">
        <span class="text-2xl text-center bold text-red-500"> Device connection failed </span>
        <span class="text-center">
          There was an issue connecting to your device, please try the following:
        </span>
        <ol class="list-decimal text-left pl-6">
          <li>
            Install the drivers for your device if you haven't already, using the button above
          </li>
          <li>Unplug and replug your device</li>
          <li>Use a different USB port</li>
          <li>Use a different USB cable</li>
          <li>
            Contact support if the issue persists:
            <a href={PUBLIC_DISCORD_INVITE_URL} target="_blank" class="underline text-blue-500">
              OpenShock Discord
            </a>
          </li>
        </ol>
      </div>
    {/if}
  </Card.Content>
</div>

{#if terminalOpen}
  <Card.Root>
    <Card.Header>
      <Card.Title class="flex flex-row items-center justify-between gap-2 text-3xl">
        Console
        <Button class="btn variant-filled-primary" onclick={() => (terminalText = '')}>
          Clear
        </Button>
      </Card.Title>
    </Card.Header>
    <Card.Content>
      <div
        class="border border-surface-500 rounded-md p-4 overflow-y-auto flex-grow overflow-auto flex flex-col-reverse"
      >
        <pre id="terminal" class="text-xs text-left">{terminalText}</pre>
      </div>
    </Card.Content>
  </Card.Root>
{/if}
