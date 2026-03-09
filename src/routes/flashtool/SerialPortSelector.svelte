<script lang="ts">
  import { Cpu, TriangleAlert, Unplug } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import type { SerialContext } from '$lib/utils/serial-context.svelte';
  import { NumberToHexPadded } from '$lib/utils/convert';

  interface Props {
    serial: SerialContext;
    port?: SerialPort | null;
    disabled?: boolean;
  }

  let { serial, port = $bindable(null), disabled = false }: Props = $props();

  const filters = [{ usbVendorId: 0x1a86 }, { usbVendorId: 0x10c4 }, { usbVendorId: 0x303a }];

  let loading = $state(false);
  let errorMessage = $state<Error | null>(null);

  async function ToggleDeviceConnection() {
    if (port !== null) {
      port = null;
      return;
    }

    loading = true;
    serial
      .requestPort({ filters })
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

  function GetHardwareID(serialPort: SerialPort | null) {
    const info = serialPort?.getInfo();
    if (!info || (!info.usbVendorId && !info.usbProductId)) {
      return 'Unknown';
    }

    let parts: string[] = [];
    if (info.usbVendorId) {
      parts.push(`VID_${NumberToHexPadded(info.usbVendorId, 4)}`);
    }
    if (info.usbProductId) {
      parts.push(`PID_${NumberToHexPadded(info.usbProductId, 4)}`);
    }

    return parts.join('&');
  }

  // Remove port if disconnected
  $effect(() => {
    if (port && !serial.ports.includes(port)) {
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
