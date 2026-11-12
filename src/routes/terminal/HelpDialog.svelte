<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { ParaglideMessage } from '@inlang/paraglide-js-svelte';
  import ArrowDownToLine from '@lucide/svelte/icons/arrow-down-to-line';
  import { PUBLIC_DISCORD_INVITE_URL } from '$app/env/public';
  import { Code, Keyboard } from '@openshock/svelte-core/components';
  import type { Snippet } from 'svelte';
  import Stepper, { type StepperStep } from '#lib/components/Stepper.svelte';
  import { DiscordLogo } from '@openshock/svelte-core/components/svg';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';

  interface Props {
    open: boolean;
    onClose: () => void;
  }

  let { open, onClose }: Props = $props();

  // Identifiers the help text refers to. Passed as inputs so translations cannot alter them.
  const DRIVER_INSTALLER = 'CP210xVCPInstaller_x64.exe';
  const DEVICE_NAME = 'Silicon Labs CP210x USB to UART Bridge';
  const SUPPORT_CHANNEL = '# 💭┃support-chat';

  function onOpenChange(open: boolean) {
    if (!open) {
      onClose();
    }
  }

  const steps: StepperStep[] = [
    { title: m.terminal_help_step_cable(), content: cableBody },
    { title: m.terminal_help_step_port(), content: portBody },
    { title: m.terminal_help_step_driver(), content: driverBody },
    { title: m.terminal_help_step_manual(), content: manualBody },
    { title: m.terminal_help_step_discord(), content: discordBody },
  ];
</script>

<Dialog.Root bind:open={() => open, onOpenChange}>
  <Dialog.Content
    class="flex h-[90dvh] w-[95vw] max-w-[95vw] flex-col gap-4 sm:w-[90vw] sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl"
  >
    <Dialog.Header>
      <Dialog.Title>
        <h2
          class="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
        >
          {m.terminal_help_title()}
        </h2>
      </Dialog.Title>
      <Dialog.Description>
        {m.terminal_help_desc()}
      </Dialog.Description>
    </Dialog.Header>

    <div class="min-h-0 flex-1 px-1 sm:px-2"><Stepper {steps} /></div>
  </Dialog.Content>
</Dialog.Root>

{#snippet code({ children }: { children?: Snippet })}
  <Code>{@render children?.()}</Code>
{/snippet}

{#snippet key({ children }: { children?: Snippet })}
  <Keyboard>{@render children?.()}</Keyboard>
{/snippet}

{#snippet cableBody()}
  <p class="text-sm">
    {m.terminal_help_cable_body()}
  </p>
{/snippet}

{#snippet portBody()}
  <p class="text-sm">
    {m.terminal_help_port_body()}
  </p>
{/snippet}

{#snippet driverBody()}
  <ol class="ml-4 flex list-decimal flex-col gap-3 text-sm">
    <li>
      <p class="mb-2">{m.terminal_help_driver_download()}</p>
      <Button
        href="https://download.openshock.org/drivers/CP210x_Universal_Windows_Driver.zip"
        target="_blank"
        rel="noopener"
      >
        <ArrowDownToLine />
        CP210x Universal Windows Driver
      </Button>
    </li>
    <li>{m.terminal_help_driver_extract()}</li>
    <li>
      <ParaglideMessage
        message={m.terminal_help_driver_run}
        inputs={{ installer: DRIVER_INSTALLER }}
        {code}
      />
    </li>
    <li>{m.terminal_help_driver_reconnect()}</li>
  </ol>
{/snippet}

{#snippet manualBody()}
  <p class="mb-2 text-sm">{m.terminal_help_manual_intro()}</p>
  <ol class="ml-4 flex list-decimal flex-col gap-3 text-sm">
    <li>
      <ParaglideMessage message={m.terminal_help_manual_open} {code} {key} />
    </li>
    <li>
      <ParaglideMessage message={m.terminal_help_manual_ports} {code} />
      <ul class="my-2 ml-6 list-disc [&>li]:mt-1">
        <li><Code>{DEVICE_NAME}</Code></li>
        <li><Code>{DEVICE_NAME} (COM...)</Code></li>
      </ul>
      {m.terminal_help_manual_missing()}
    </li>
    <li>
      <ParaglideMessage message={m.terminal_help_manual_update} {code} />
    </li>
    <li>
      <ParaglideMessage message={m.terminal_help_manual_browse} {code} />
    </li>
    <li>
      <ParaglideMessage
        message={m.terminal_help_manual_success}
        inputs={{ deviceName: DEVICE_NAME }}
        {code}
      />
    </li>
  </ol>
{/snippet}

{#snippet discordBody()}
  <div class="flex flex-col gap-3 text-sm">
    <p>
      <ParaglideMessage
        message={m.terminal_help_discord_intro}
        inputs={{ channel: SUPPORT_CHANNEL }}
        {code}
      />
    </p>
    <ul class="text-muted-foreground ml-6 list-disc [&>li]:mt-1">
      <li>{m.terminal_help_discord_os()}</li>
      <li>{m.terminal_help_discord_device()}</li>
      <li>{m.terminal_help_discord_tried()}</li>
      <li>{m.terminal_help_discord_errors()}</li>
    </ul>
    <Button href={PUBLIC_DISCORD_INVITE_URL} target="_blank" rel="noopener" class="w-fit">
      <DiscordLogo class="fill-current" />
      {m.terminal_help_discord_join()}
    </Button>
  </div>
{/snippet}
