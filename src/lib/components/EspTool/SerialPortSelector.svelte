<script lang="ts">
  import Bowser from 'bowser';
  import { browser } from '$app/environment';
  import { PUBLIC_DISCORD_INVITE_URL } from '$env/static/public';
  import * as Card from '$lib/components/ui/card';
  import * as Dialog from '$lib/components/ui/dialog';
  import { SerialPortsStore } from '$lib/stores/SerialPortsStore';
  import { Button, buttonVariants } from '$lib/components/ui/button';

  interface Props {
    port?: SerialPort | null;
    disabled?: boolean;
    terminalOpen?: boolean;
  }

  let { port = $bindable(null), disabled = false, terminalOpen = $bindable(false) }: Props = $props();

  const filters = [{ usbVendorId: 0x1a86 }, { usbVendorId: 0x10c4 }, { usbVendorId: 0x303a }];

  let loading = $state(false);
  let errorMessage: Error | null = $state(null);

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

  // Remove port if disconnected
  $effect(() => {
    if (port && !$SerialPortsStore.includes(port)) {
      port = null;
    }
  });
</script>

<div>
  {#if !browser}
    <h3 class="h3">Loading...</h3>
  {:else if 'serial' in navigator}
    <div class="flex flex-row items-center justify-between">
      <h3 class="h3 font-bold">Select your device</h3>
      <button
        onclick={() => terminalOpen = !terminalOpen}
        class="btn btn-icon variant-outline-primary"
        aria-label="Toggle terminal"
      >
        <i class={"fa fa-arrow-right transition " + (terminalOpen ? "rotate-180" : "")}></i>
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
        <Button
          class="flex-1"
          onclick={OpenPort}
          disabled={disabled || loading}
        >
          <i class="fa fa-microchip"></i>
          Select Device
        </Button>
        <Dialog.Root>
          <Dialog.Trigger class={"flex-1 " + buttonVariants({ variant: "default" })}>
            <i class="fa fa-download"></i>
            Install Drivers
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Install device drivers</Dialog.Title>
              <Dialog.Description>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
              </Dialog.Description>
            </Dialog.Header>
            <section class="flex flex-col p-4 gap-4">
              <div class="flex flex-col gap-1">
                <h4 class="h4">1. Download drivers</h4>
                <a
                  href="https://download.openshock.org/drivers/CP210x_Universal_Windows_Driver.zip"
                  target="_parent"
                  rel="noopener noreferrer"
                  class="btn variant-filled-primary gap-2"
                >
                  <i class="fa fa-download" ></i>
                  CP210x Universal Windows Driver
                </a>
              </div>
              <div class="flex flex-col gap-1">
                <h4 class="h4">2. Extract the zip file</h4>
                <p>Extract the contents of the zip file to a folder on your computer.</p>
              </div>
              <div class="flex flex-col gap-1">
                <h4 class="h4">3. Run the installer</h4>
                <p>
                  Go to the folder where you extracted the zip file and run
                  <code class="code">CP210xVCPInstaller_x64.exe</code><br />
                  Follow the instructions to install the drivers.
                </p>
              </div>
              <h3 class="h3 font-bold mt-6">If the device still doesn't appear in the list:</h3>
              <div class="flex flex-col gap-1">
                <h4 class="h4">1. Open Device Manager</h4>
                <p>
                  Press <kbd class="kbd">Win</kbd> + <kbd class="kbd">X</kbd> and select
                  <code class="code">Device Manager</code>.
                </p>
              </div>
              <div class="flex flex-col gap-1">
                <h4 class="h4">2. Find your device</h4>
                <p>
                  Go to <code class="code">Ports (COM & LPT)</code> and look a device similar to one of the following:
                </p>
                <ul class="list">
                  <li><code class="code">Silicon Labs CP210x USB to UART Bridge</code></li>
                  <li><code class="code">Silicon Labs CP210x USB to UART Bridge (COM...)</code></li>
                </ul>
                <p>
                  If you don't see it in the list, make sure that your device is connected to your computer.
                </p>
              </div>
              <div class="flex flex-col gap-1">
                <h4 class="h4">3. Update drivers</h4>
                <p>
                  Right click on the device and select <code class="code">Update Driver</code>.
                </p>
                <p>
                  Select <code class="code">Browse my computer for drivers</code> and browse to the folder where
                  you extracted the zip file.
                </p>
                <p>Make sure that <code class="code">Include subfolders</code> option is checked.</p>
                <p>
                  If successful, you should see <code class="code"
                >Silicon Labs CP210x USB to UART Bridge</code
                > in the list.
                </p>
              </div>
              <h3 class="h3 font-bold mt-6">Still having problems?</h3>
              <div class="flex flex-col gap-1">
                <p>
                  If you still have problems, join our discord server and ask for help in the <code
                  class="code">#support</code
                >
                  channel.
                </p>
                <a
                  href={PUBLIC_DISCORD_INVITE_URL}
                  target="_parent"
                  rel="noopener noreferrer"
                  class="btn variant-filled-primary gap-2"
                >
                  <i class="fa-brands fa-discord"></i>
                  Join our Discord server
                </a>
              </div>
            </section>
          </Dialog.Content>
        </Dialog.Root>
      {:else}
        <Button
          onclick={() => (port = null)}
          disabled={disabled || loading}
        >
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
