<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { SerialPortsStore } from '$lib/stores/SerialPortsStore';

  import { Cpu, TriangleAlert, Unplug } from '@lucide/svelte';

  interface Props {
    port?: SerialPort | null;
    disabled?: boolean;
  }

  let { port = $bindable(null), disabled = false }: Props = $props();

  const filters = [{ usbVendorId: 0x1a86 }, { usbVendorId: 0x10c4 }, { usbVendorId: 0x303a }];

  let loading = $state(false);
  let errorMessage = $state<Error | null>(null);

  async function ToggleDeviceConnection() {
    if (port !== null) {
      port = null;
      return;
    }

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

  // Remove port if disconnected
  $effect(() => {
    if (port && !$SerialPortsStore.includes(port)) {
      port = null;
    }
  });
</script>

<div>
  <div class="flex flex-row justify-stretch gap-3">
    <Button class="flex-1" onclick={ToggleDeviceConnection} disabled={disabled || loading}>
      {#if port === null}
        <Cpu />
        Select Device
      {:else}
        <Unplug />
        Disconnect Device
      {/if}
    </Button>
  </div>
  {#if port !== null || (errorMessage !== null && errorMessage.name !== 'NotFoundError')}
    <div class="p-2">
      {#if port !== null}
        <p class="text-green-500">
          Device connected: <span class="font-bold">{GetHardwareID(port)}</span>
        </p>
      {/if}
      {#if errorMessage !== null && errorMessage.name !== 'NotFoundError'}
        <div class="flex flex-row items-center justify-start gap-2">
          <TriangleAlert color="#eab308" />
          <p class="text-yellow-500">Error: {errorMessage.message}</p>
        </div>
      {/if}
    </div>
  {/if}
</div>
