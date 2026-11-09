<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { Microchip, TriangleAlert } from '@lucide/svelte';
  import { DownloadAndVerifyBoardBinary } from '#lib/api/firmwareCDN.js';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import { Progress } from '@openshock/svelte-core/components/ui/progress';
  import RiskAcknowledgementModal from './RiskAcknowledgementModal.svelte';
  import type EspSerialConnection from './EspSerialConnection';

  interface Props {
    version: string;
    board: string;
    connection: EspSerialConnection;
    eraseBeforeFlash: boolean;
    showNonStableWarning: boolean;
    isFlashing: boolean;
    onComplete?: () => void;
  }

  let {
    version,
    board,
    connection,
    eraseBeforeFlash,
    showNonStableWarning,
    isFlashing = $bindable(),
    onComplete,
  }: Props = $props();

  let riskAcknowledgeStatus = $state<'none' | 'shown' | 'accepted'>('none');
  let progressName = $state<string | null>(null);
  let progressPercent = $state<number | null>(null);
  let error = $state<string | null>(null);

  async function FlashDeviceImpl() {
    if (!version || !board || !connection) {
      progressName = null;
      error = m.terminal_flash_no_device();
      return;
    }

    error = null;

    function progressCallback(progress: number) {
      if (!progressName) return;
      progressPercent = progress * 100;
    }

    progressName = m.terminal_flash_resetting();
    progressPercent = null;
    await connection.ensureBootloader();

    progressName = m.terminal_flash_downloading();
    progressPercent = null;
    const firmware = await DownloadAndVerifyBoardBinary(version, board, 'firmware.bin');
    if (!firmware) {
      progressName = null;
      error = m.terminal_flash_download_failed();
      return;
    }

    progressName = m.terminal_flash_flashing();
    progressPercent = null;
    await connection.flash(firmware, eraseBeforeFlash, progressCallback);

    progressName = m.terminal_flash_rebooting();
    progressPercent = null;
    await connection.ensureApplication();

    progressName = m.terminal_flash_done();
    progressPercent = 100;
    return true;
  }
  async function FlashDevice() {
    if (isFlashing) return;
    if (showNonStableWarning && riskAcknowledgeStatus !== 'accepted') {
      riskAcknowledgeStatus = 'shown';
      return;
    }
    let success = false;
    try {
      isFlashing = true;
      success = (await FlashDeviceImpl()) ?? false;
    } catch (e) {
      error = (e as Error).message;
    } finally {
      isFlashing = false;
    }
    if (success) onComplete?.();
  }
</script>

<RiskAcknowledgementModal
  open={showNonStableWarning && riskAcknowledgeStatus !== 'accepted'}
  onAccept={() => (riskAcknowledgeStatus = 'accepted')}
  onCancel={() => (riskAcknowledgeStatus = 'none')}
/>

<div class="flex flex-col items-stretch justify-start gap-4">
  <!-- Flash button -->
  <Button onclick={FlashDevice} disabled={!connection || isFlashing}>
    <Microchip />
    {m.terminal_flash_button()}
  </Button>

  <!-- Flash progress -->
  <div class="flex flex-col items-start justify-start gap-2 p-2">
    {#if error}
      <div class="flex flex-row items-center justify-start gap-2">
        <TriangleAlert class="text-destructive" />
        <p class="text-destructive">{m.common_error({ message: error })}</p>
      </div>
    {:else}
      <span>
        {m.terminal_flash_progress({ status: progressName ?? m.terminal_flash_idle() })}
        {#if progressPercent !== null}
          ({progressPercent.toFixed(2)}%)
        {/if}
      </span>
      {#if progressName !== null}
        <Progress value={progressPercent} max={100} />
      {/if}
    {/if}
  </div>
</div>
