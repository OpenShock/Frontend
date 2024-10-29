<script lang="ts">
  import { PUBLIC_DISCORD_INVITE_URL } from '$env/static/public';
  import FirmwareFlasher from '$lib/components/EspTool/FirmwareFlasher.svelte';
  import FirmwareSelector from '$lib/components/EspTool/FirmwareSelector.svelte';
  import FlashManager from '$lib/components/EspTool/FlashManager';
  import SerialPortSelector from '$lib/components/EspTool/SerialPortSelector.svelte';
  import { modalRegistry } from '$lib/modals';
  import { FlashManagerStore } from '$lib/stores/FlashManagersStore';
  import { Modal, ProgressBar, initializeStores } from '@skeletonlabs/skeleton';

  initializeStores();

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

<Modal components={modalRegistry} />
<div class="flex w-full h-full items-center">
  <div class="flex w-full h-max justify-center items-center lg:items-stretch gap-4 flex-col lg:flex-row">
    <div class="flex-grow card p-4 min-w-[25em] lg:max-w-[50%] flex flex-col justify-center gap-8 w-[95%]">
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
            <ProgressBar />
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
              <a
                href={PUBLIC_DISCORD_INVITE_URL}
                target="_blank"
                class="underline text-blue-500"
              >
                OpenShock Discord
              </a>
            </li>
          </ol>
        </div>
      {/if}
    </div>

    {#if terminalOpen}
      <div class="flex-grow card p-4 flex flex-col justify-center gap-2 w-[95%] h-56 min-w-[15em] lg:max-w-[25%] lg:h-auto">
        <div class="flex flex-row items-center justify-between gap-2">
          <h3 class="h3 font-bold">Console</h3>
          <button class="btn variant-filled-primary" onclick={() => (terminalText = '')}
            >Clear</button
          >
        </div>
        <div
          class="border border-surface-500 rounded-md p-4 overflow-y-auto flex-grow overflow-auto flex flex-col-reverse"
        >
          <pre id="terminal" class="text-xs text-left">{terminalText}</pre>
        </div>
      </div>
    {/if}
  </div>
</div>
