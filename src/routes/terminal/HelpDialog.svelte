<script lang="ts">
  import ArrowDownToLine from '@lucide/svelte/icons/arrow-down-to-line';
  import { PUBLIC_DISCORD_INVITE_URL } from '$env/static/public';
  import Code from '$lib/components/Code.svelte';
  import Keyboard from '$lib/components/Keyboard.svelte';
  import Stepper, { type StepperStep } from '$lib/components/Stepper.svelte';
  import DiscordLogo from '$lib/components/svg/DiscordLogo.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';

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

  const steps: StepperStep[] = [
    { title: 'USB cable', content: cableBody },
    { title: 'USB port', content: portBody },
    { title: 'Install driver', content: driverBody },
    { title: 'Manual driver update', content: manualBody },
    { title: 'Ask on Discord', content: discordBody },
  ];
</script>

<Dialog.Root bind:open={() => open, onOpenChange}>
  <Dialog.Content
    class="flex h-[90vh] max-h-[90vh] w-[95vw] max-w-[95vw] flex-col gap-4 sm:w-[90vw] sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl"
  >
    <Dialog.Header>
      <Dialog.Title>
        <h2
          class="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
        >
          Troubleshooter
        </h2>
      </Dialog.Title>
      <Dialog.Description>
        Work through these steps in order. Each one rules out a common cause.
      </Dialog.Description>
    </Dialog.Header>
    <div class="min-h-0 flex-1 px-1 sm:px-2">
      <Stepper {steps} />
    </div>
  </Dialog.Content>
</Dialog.Root>

{#snippet cableBody()}
  <p class="text-sm">
    Many USB-C and micro-USB cables are charge-only and don't carry data. Swap to a known-good data
    cable (one you've used to transfer files or connect other devices) and reconnect the hub.
  </p>
{/snippet}

{#snippet portBody()}
  <p class="text-sm">
    Plug the device directly into a USB port on your computer. Avoid USB hubs, docking stations, and
    front-panel ports if possible; these are common sources of power and signal issues. If you're on
    a desktop, try a port on the back of the machine.
  </p>
{/snippet}

{#snippet driverBody()}
  <ol class="ml-4 flex list-decimal flex-col gap-3 text-sm">
    <li>
      <p class="mb-2">Download the CP210x driver:</p>
      <Button
        href="https://download.openshock.org/drivers/CP210x_Universal_Windows_Driver.zip"
        target="_blank"
      >
        <ArrowDownToLine />
        CP210x Universal Windows Driver
      </Button>
    </li>
    <li>Extract the contents of the zip file to a folder on your computer.</li>
    <li>
      Open the folder and run <Code>CP210xVCPInstaller_x64.exe</Code>. Follow the prompts to
      install.
    </li>
    <li>Reconnect the device.</li>
  </ol>
{/snippet}

{#snippet manualBody()}
  <p class="mb-2 text-sm">If the driver installer ran but the device still doesn't show up:</p>
  <ol class="ml-4 flex list-decimal flex-col gap-3 text-sm">
    <li>
      Open Device Manager (press <Keyboard>Win</Keyboard> + <Keyboard>X</Keyboard> and select
      <Code>Device Manager</Code>).
    </li>
    <li>
      Under <Code>Ports (COM & LPT)</Code>, look for an entry like:
      <ul class="my-2 ml-6 list-disc [&>li]:mt-1">
        <li><Code>Silicon Labs CP210x USB to UART Bridge</Code></li>
        <li><Code>Silicon Labs CP210x USB to UART Bridge (COM...)</Code></li>
      </ul>
      If it's missing, the device isn't being detected by Windows at all; revisit the cable and port steps.
    </li>
    <li>
      Right-click the device and pick <Code>Update Driver</Code>.
    </li>
    <li>
      Choose <Code>Browse my computer for drivers</Code> and select the folder you extracted the driver
      zip into. Make sure <Code>Include subfolders</Code> is checked.
    </li>
    <li>
      On success, the entry should now read <Code>Silicon Labs CP210x USB to UART Bridge</Code>.
    </li>
  </ol>
{/snippet}

{#snippet discordBody()}
  <div class="flex flex-col gap-3 text-sm">
    <p>
      Still stuck after all of the above? Hop into our Discord server and ask in the
      <Code># 💭┃support-chat</Code> channel. Please include:
    </p>
    <ul class="text-muted-foreground ml-6 list-disc [&>li]:mt-1">
      <li>your operating system and browser</li>
      <li>the device you're using (board model, where you got it)</li>
      <li>what you've already tried from the previous steps</li>
      <li>any error messages or relevant terminal output</li>
    </ul>
    <Button href={PUBLIC_DISCORD_INVITE_URL} target="_blank" class="w-fit">
      <DiscordLogo class="fill-white dark:fill-black" />
      Join our Discord server
    </Button>
  </div>
{/snippet}
