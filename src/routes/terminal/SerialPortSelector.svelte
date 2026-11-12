<script lang="ts" module>
  const filters = [{ usbVendorId: 0x1a86 }, { usbVendorId: 0x10c4 }, { usbVendorId: 0x303a }];
</script>

<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { ParaglideMessage } from '@inlang/paraglide-js-svelte';
  import { Cpu, TriangleAlert, Unplug } from '@lucide/svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import { getHardwareId, type SerialContext } from '#lib/utils/serial-context.svelte.js';

  interface Props {
    serial: SerialContext;
    port?: SerialPort | null;
    disabled?: boolean;
  }

  let { serial, port = $bindable(null), disabled = false }: Props = $props();

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
        {m.terminal_port_select()}
      {:else}
        <Unplug />
        {m.terminal_port_disconnect()}
      {/if}
    </Button>
  </div>
  {#if port !== null || (errorMessage !== null && errorMessage.name !== 'NotFoundError')}
    <div class="p-2">
      {#if port !== null}
        <p class="text-success">
          <ParaglideMessage
            message={m.terminal_port_connected}
            inputs={{ id: getHardwareId(port) }}
          >
            {#snippet strong({ children })}
              <span class="font-bold">{@render children?.()}</span>
            {/snippet}
          </ParaglideMessage>
        </p>
      {/if}
      {#if errorMessage !== null && errorMessage.name !== 'NotFoundError'}
        <div class="flex flex-row items-center justify-start gap-2">
          <TriangleAlert class="text-warning" />
          <p class="text-warning">{m.common_error({ message: errorMessage.message })}</p>
        </div>
      {/if}
    </div>
  {/if}
</div>
