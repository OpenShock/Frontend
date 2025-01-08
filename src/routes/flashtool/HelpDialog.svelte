<script lang="ts">
  import { PUBLIC_DISCORD_INVITE_URL } from '$env/static/public';
  import DiscordLogo from '$lib/components/svg/DiscordLogo.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import { ScrollArea } from '$lib/components/ui/scroll-area';

  interface Props {
    open: boolean;
    onClose: () => void;
  }

  let { open, onClose }: Props = $props();

  function onOpenChange(open: boolean) {
    if (!open) {
      onClose();
    }
  }
</script>

<Dialog.Root bind:open={() => open, onOpenChange}>
  <Dialog.Content class="max-w-fit">
    <Dialog.Header>
      <Dialog.Title>
        <h2
          class="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
        >
          Troubleshooter
        </h2>
      </Dialog.Title>
    </Dialog.Header>
    <ScrollArea orientation="vertical" class="max-h-[80vh]">
      <div class="flex flex-col gap-4 p-4">
        <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">Install drivers</h3>
        <div class="flex flex-col gap-1">
          <h4 class="h4 font-bold">1. Download drivers</h4>
          <div class="pl-4">
            <Button
              href="https://download.openshock.org/drivers/CP210x_Universal_Windows_Driver.zip"
              target="_blank"
            >
              <i class="fa fa-download"></i>
              CP210x Universal Windows Driver
            </Button>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <h4 class="h4 font-bold">2. Extract the zip file</h4>
          <div class="pl-4">
            <p>Extract the contents of the zip file to a folder on your computer.</p>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <h4 class="h4 font-bold">3. Run the installer</h4>
          <div class="pl-4">
            <p>
              Go to the folder where you extracted the zip file and run
              <code class="code">CP210xVCPInstaller_x64.exe</code><br />
              Follow the instructions to install the drivers.
            </p>
          </div>
        </div>
        <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">
          If the device still doesn't appear in the list
        </h3>
        <div class="flex flex-col gap-1">
          <h4 class="h4">1. Open Device Manager</h4>
          <div class="pl-4">
            <p>
              Press <kbd class="kbd">Win</kbd> + <kbd class="kbd">X</kbd> and select
              <code class="code">Device Manager</code>.
            </p>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <h4 class="h4">2. Find your device</h4>
          <div class="pl-4">
            <p>
              Go to <code class="code">Ports (COM & LPT)</code> and look a device similar to one of the
              following:
            </p>
            <ul class="my-2 ml-6 list-disc [&>li]:mt-2">
              <li><code class="code">Silicon Labs CP210x USB to UART Bridge</code></li>
              <li><code class="code">Silicon Labs CP210x USB to UART Bridge (COM...)</code></li>
            </ul>
            <p>
              If you don't see it in the list, make sure that your device is connected to your
              computer.
            </p>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <h4 class="h4">3. Update drivers</h4>
          <div class="pl-4">
            <p>
              Right click on the device and select <code class="code">Update Driver</code>.
            </p>
            <p>
              Select <code class="code">Browse my computer for drivers</code> and browse to the folder
              where you extracted the zip file.
            </p>
            <p>Make sure that <code class="code">Include subfolders</code> option is checked.</p>
            <p>
              If successful, you should see <code class="code"
                >Silicon Labs CP210x USB to UART Bridge</code
              > in the list.
            </p>
          </div>
        </div>
      </div>
    </ScrollArea>
    <Dialog.Footer>
      <Button href={PUBLIC_DISCORD_INVITE_URL} target="_blank">
        <DiscordLogo class="fill-white dark:fill-black" />
        Stuck? join our Discord server
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
