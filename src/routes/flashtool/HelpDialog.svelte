<script lang="ts">
  import { ArrowDownToLine } from '@lucide/svelte';
  import { PUBLIC_DISCORD_INVITE_URL } from '$env/static/public';
  import Code from '$lib/components/Code.svelte';
  import Keyboard from '$lib/components/Keyboard.svelte';
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
              <ArrowDownToLine />
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
              <Code>CP210xVCPInstaller_x64.exe</Code><br />
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
              Press <Keyboard>Win</Keyboard> + <Keyboard>X</Keyboard> and select
              <Code>Device Manager</Code>.
            </p>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <h4 class="h4">2. Find your device</h4>
          <div class="pl-4">
            <p>
              Go to <Code>Ports (COM & LPT)</Code> and look a device similar to one of the following:
            </p>
            <ul class="my-2 ml-6 list-disc [&>li]:mt-2">
              <li><Code>Silicon Labs CP210x USB to UART Bridge</Code></li>
              <li><Code>Silicon Labs CP210x USB to UART Bridge (COM...)</Code></li>
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
              Right click on the device and select <Code>Update Driver</Code>.
            </p>
            <p>
              Select <Code>Browse my computer for drivers</Code> and browse to the folder where you extracted
              the zip file.
            </p>
            <p>Make sure that <Code>Include subfolders</Code> option is checked.</p>
            <p>
              If successful, you should see <Code>Silicon Labs CP210x USB to UART Bridge</Code> in the
              list.
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
