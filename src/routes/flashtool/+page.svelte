<script lang="ts">
  import { PUBLIC_DISCORD_INVITE_URL } from '$env/static/public';
  import FirmwareFlasher from '$lib/components/EspTool/FirmwareFlasher.svelte';
  import FirmwareSelector from '$lib/components/EspTool/FirmwareSelector.svelte';
  import FlashManager from '$lib/components/EspTool/FlashManager';
  import SerialPortSelector from '$lib/components/EspTool/SerialPortSelector.svelte';
  import { Progress } from '$lib/components/ui/progress';
  import { FlashManagerStore } from '$lib/stores/FlashManagersStore';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';

  let port: SerialPort | null = $state(null);
  let manager: FlashManager | null = $state(null);
  let connectFailed = $state(false);
  let isFlashing = $state(false);

  let terminalOpen: boolean = $state(false);
  let terminalText: string = $state('');

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

  let version: string | null = $state(null);
  let board: string | null = $state(null);
</script>

<Card.Root>
  <Card.Header>
    <Card.Title class="text-3xl">Flash Tool</Card.Title>
  </Card.Header>
  <Card.Content>
    <SerialPortSelector bind:terminalOpen bind:port disabled={isFlashing} />
    {#if port}
      {#if manager}
        <FirmwareSelector bind:version bind:board disabled={isFlashing} />
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
</Card.Root>
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
