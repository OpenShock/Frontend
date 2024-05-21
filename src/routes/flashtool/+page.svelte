<script lang="ts">
  import FirmwareFlasher from '$lib/components/EspTool/FirmwareFlasher.svelte';
  import FirmwareSelector from '$lib/components/EspTool/FirmwareSelector.svelte';
  import FlashManager from '$lib/components/EspTool/FlashManager';
  import SerialPortSelector from '$lib/components/EspTool/SerialPortSelector.svelte';
  import { modalRegistry } from '$lib/modals';
  import { FlashManagerStore } from '$lib/stores/FlashManagersStore';
  import { Modal, ProgressBar, initializeStores } from '@skeletonlabs/skeleton';

  initializeStores();

  let port: SerialPort | null = null;
  let manager: FlashManager | null = null;
  let connectFailed = false;
  let isFlashing = false;

  const terminal = {
    clean: () => {
      //console.clear();
    },
    writeLine: (data: string) => {
      console.log(data);
    },
    write: (data: string) => {
      console.log(data);
    },
  };

  $: if (port && !manager) {
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

  let version: string | null = null;
  let board: string | null = null;
</script>

<Modal components={modalRegistry} />

<div class="w-full h-full flex-auto content-center justify-center items-center py-8">
  <div class="card p-4 m-auto max-w-[55em] flex flex-col justify-center gap-8">
    <SerialPortSelector bind:port disabled={isFlashing} />
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
      <div class="flex flex-col items-center gap-2">
        <span class="text-2xl text-center text-red-500"> Connection failed. </span>
        <span class="text-center"> Please try again. </span>
      </div>
    {/if}
  </div>
</div>
