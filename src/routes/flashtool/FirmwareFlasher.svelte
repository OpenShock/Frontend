<script lang="ts">
  import { Microchip, TriangleAlert } from '@lucide/svelte';
  import { DownloadAndVerifyBoardBinary } from '$lib/api/firmwareCDN';
  import { Button } from '$lib/components/ui/button';
  import { Progress } from '$lib/components/ui/progress';
  import type { FlashContext } from './flash-context.svelte';
  import RiskAcknowledgementModal from './RiskAcknowledgementModal.svelte';

  interface Props {
    version: string;
    board: string;
    flash: FlashContext;
    eraseBeforeFlash: boolean;
    showNonStableWarning: boolean;
  }

  let { version, board, flash, eraseBeforeFlash, showNonStableWarning }: Props = $props();

  let riskAcknowledgeStatus = $state<'none' | 'shown' | 'accepted'>('none');
  let progressName = $state<string | null>(null);
  let progressPercent = $state<number | null>(null);
  let error = $state<string | null>(null);

  async function FlashDeviceImpl() {
    if (!version || !board || !flash.manager) {
      progressName = null;
      error = 'No device selected.';
      return;
    }

    error = null;

    function progressCallback(progress: number) {
      if (!progressName) return;
      progressPercent = progress * 100;
    }

    progressName = 'Resetting...';
    progressPercent = null;
    await flash.manager.ensureBootloader();

    progressName = 'Downloading firmware...';
    progressPercent = null;
    const firmware = await DownloadAndVerifyBoardBinary(version, board, 'firmware.bin');
    if (!firmware) {
      progressName = null;
      error = 'Failed to download firmware.';
      return;
    }

    progressName = 'Flashing firmware...';
    progressPercent = null;
    await flash.manager.flash(firmware, eraseBeforeFlash, progressCallback);

    progressName = 'Rebooting device... (Reconnect to power manually if stuck)';
    progressPercent = null;
    await flash.manager.ensureApplication();

    progressName = 'Rebooted device! Flashing complete.';
    progressPercent = 100;
  }
  async function FlashDevice() {
    if (flash.isFlashing) return;
    if (showNonStableWarning && riskAcknowledgeStatus !== 'accepted') {
      riskAcknowledgeStatus = 'shown';
      return;
    }
    try {
      flash.isFlashing = true;
      await FlashDeviceImpl();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      flash.isFlashing = false;
    }
  }
</script>

<RiskAcknowledgementModal
  open={showNonStableWarning && riskAcknowledgeStatus !== 'accepted'}
  onAccept={() => (riskAcknowledgeStatus = 'accepted')}
  onCancel={() => (riskAcknowledgeStatus = 'none')}
/>

<div class="flex flex-col items-stretch justify-start gap-4">
  <!-- Flash button -->
  <Button onclick={FlashDevice} disabled={!flash.manager || flash.isFlashing}>
    <Microchip />
    Flash
  </Button>

  <!-- Flash progress -->
  <div class="flex flex-col items-start justify-start gap-2 p-2">
    {#if error}
      <div class="flex flex-row items-center justify-start gap-2">
        <TriangleAlert color="#ef4444" />
        <p class="text-red-500">Error: {error}</p>
      </div>
    {:else}
      <span>
        Flash Progress: {progressName ?? 'Idle'}
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
