<script lang="ts">
  import { browser } from '$app/environment';
  import { Button } from '$lib/components/ui/button';
  import { SerialPortsStore } from '$lib/stores/SerialPortsStore';
  import Bowser from 'bowser';
  import InstallDriversDialog from './InstallDriversDialog.svelte';

  import { ArrowDownToLine, Cpu } from 'lucide-svelte';

  interface Props {
    port?: SerialPort | null;
    disabled?: boolean;
    terminalOpen?: boolean;
  }

  let {
    port = $bindable(null),
    disabled = false,
    terminalOpen = $bindable(false),
  }: Props = $props();

  const filters = [{ usbVendorId: 0x1a86 }, { usbVendorId: 0x10c4 }, { usbVendorId: 0x303a }];

  let loading = $state(false);
  let errorMessage = $state<Error | null>(null);

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

  let showInstallDriversDialog = $state(false);

  // Remove port if disconnected
  $effect(() => {
    if (port && !$SerialPortsStore.includes(port)) {
      port = null;
    }
  });
</script>

<div>
  <InstallDriversDialog
    open={showInstallDriversDialog}
    onClose={() => (showInstallDriversDialog = false)}
  />

  {#if !browser}
    <h3 class="h3">Loading...</h3>
  {:else if 'serial' in navigator}
    <div class="flex flex-row items-center justify-between">
      <h3 class="h3 font-bold">Select your device</h3>
      <button
        onclick={() => (terminalOpen = !terminalOpen)}
        class="btn btn-icon variant-outline-primary"
        aria-label="Toggle terminal"
      >
        <i class={'fa fa-arrow-right transition ' + (terminalOpen ? 'rotate-180' : '')}></i>
      </button>
    </div>
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
          <i class="fa fa-exclamation-triangle text-yellow-500"></i>
          <p class="text-yellow-500">Error: {errorMessage.message}</p>
        </div>
      {/if}
    </div>
    <div class="flex flex-row gap-3 justify-stretch">
      {#if port === null}
        <Button class="flex-1" onclick={OpenPort} disabled={disabled || loading}>
          <Cpu />
          Select Device
        </Button>
        <Button class="flex-1" onclick={() => (showInstallDriversDialog = true)}>
          <ArrowDownToLine />
          Install Drivers
        </Button>
      {:else}
        <Button onclick={() => (port = null)} disabled={disabled || loading}>
          <i class="fa fa-times"></i>
          Disconnect Device
        </Button>
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
        <span class="fa-brands fa-chrome fa-xl"></span>
        <span>Chrome</span>
      </a>
      <a class="logo-item" href="https://www.microsoft.com/en-us/edge">
        <span class="fa-brands fa-edge fa-xl"></span>
        <span>Edge</span>
      </a>
      <a class="logo-item" href="https://www.opera.com/">
        <span class="fa-brands fa-opera fa-xl"></span>
        <span>Opera</span>
      </a>
    </div>
  {/if}
</div>
