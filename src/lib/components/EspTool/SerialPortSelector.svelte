<script lang="ts">
  import Bowser from 'bowser';
  import { browser } from '$app/environment';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import { SerialPortsStore } from '$lib/stores/SerialPortsStore';

  export let port: SerialPort | null = null;
  export let disabled: boolean = false;

  const filters = [{ usbVendorId: 0x1a86 }, { usbVendorId: 0x10c4 }, { usbVendorId: 0x303a }];

  const modalStore = getModalStore();

  let loading = false;
  let errorMessage: Error | null = null;

  // Remove port if disconnected
  $: if (port && !$SerialPortsStore.includes(port)) {
    port = null;
  }

  async function OpenPort() {
    loading = true;
    SerialPortsStore.requestPort({ filters })
      .then((p) => {
        port = p;
      })
      .catch((e) => {
        errorMessage = e as Error;
      })
      .finally(() => {
        loading = false;
      });
  }

  function NumberToHex(number: number) {
    return number.toString(16).padStart(2, '0').toUpperCase();
  }
  function GetHardwareID(serialPort: SerialPort | null) {
    const info = serialPort?.getInfo();
    if (!info || (!info.usbVendorId && !info.usbProductId)) {
      return 'Unknown';
    }

    let parts: string[] = [];
    if (info.usbVendorId) {
      parts.push(`VID_${NumberToHex(info.usbVendorId)}`);
    }
    if (info.usbProductId) {
      parts.push(`PID_${NumberToHex(info.usbProductId)}`);
    }

    return parts.join('&');
  }
</script>

<div>
  {#if !browser}
    <h3 class="h3">Loading...</h3>
  {:else if 'serial' in navigator}
    <h3 class="h3 font-bold">Select your device</h3>
    <div class="p-2">
      {#if port === null}
        <p>Please connect your device to your computer.</p>
        <p>If you don't see your device in the popup, then you may need to install drivers.</p>
      {:else}
        <p class="text-green-500">Device connected</p>
        <p class="text-green-500">
          HardwareID: <span class="font-bold">{GetHardwareID(port)}</span>
        </p>
      {/if}
      {#if errorMessage !== null && errorMessage.name !== 'NotFoundError'}
        <div class="flex flex-row items-center justify-start gap-2">
          <i class="fas fa-exclamation-triangle text-yellow-500" />
          <p class="text-yellow-500">Error: {errorMessage.message}</p>
        </div>
      {/if}
    </div>
    <div class="flex flex-row items-stretch justify-start gap-3">
      {#if port === null}
        <button
          class="btn variant-filled-primary gap-2 flex-1"
          on:click={OpenPort}
          disabled={disabled || loading}
        >
          <i class="fa fa-microchip" />
          Select Device
        </button>
        <button
          class="btn variant-filled-primary gap-2 flex-1"
          on:click={() => modalStore.trigger({ type: 'component', component: 'InstallDrivers' })}
          disabled={disabled || loading}
        >
          <i class="fa fa-download" />
          Install Drivers
        </button>
      {:else}
        <button
          class="btn variant-filled-primary gap-2 w-full"
          on:click={() => (port = null)}
          disabled={disabled || loading}
        >
          <i class="fa fa-times" />
          Disconnect Device
        </button>
      {/if}
    </div>
  {:else if ['Chrome', 'Edge', 'Opera'].includes(Bowser.getParser(window.navigator.userAgent).getBrowserName())}
    <h2 class="h2 mb-16">Your browser version does not support this feature.</h2>
    <h3 class="h3">Please update your browser to the latest version.</h3>
  {:else}
    <h2 class="h2 mb-16">Your browser does not support this feature.</h2>
    <h3 class="h3">Please use one of the following browsers:</h3>
    <div class="logo-cloud grid-cols-1 lg:!grid-cols-3 gap-1">
      <a class="logo-item" href="https://www.google.com/chrome/">
        <span class="fa-brands fa-chrome fa-xl" />
        <span>Chrome</span>
      </a>
      <a class="logo-item" href="https://www.microsoft.com/en-us/edge">
        <span class="fa-brands fa-edge fa-xl" />
        <span>Edge</span>
      </a>
      <a class="logo-item" href="https://www.opera.com/">
        <span class="fa-brands fa-opera fa-xl" />
        <span>Opera</span>
      </a>
    </div>
  {/if}
</div>
