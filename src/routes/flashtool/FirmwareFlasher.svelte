<script lang="ts">
  import { Microchip, TriangleAlert } from '@lucide/svelte';
  import {
    DownloadAndVerifyArtifact,
    FindArtifact,
    type FirmwareLatestResponse,
  } from '$lib/api/firmwareRepo';
  import { Button } from '$lib/components/ui/button';
  import { Progress } from '$lib/components/ui/progress';
  import FlashManager from './FlashManager';
  import RiskAcknowledgementModal from './RiskAcknowledgementModal.svelte';

  interface Props {
    latestResponse: FirmwareLatestResponse;
    board: string;
    manager: FlashManager;
    eraseBeforeFlash: boolean;
    showNonStableWarning: boolean;
    isFlashing?: boolean;
  }

  let {
    latestResponse,
    board,
    manager,
    eraseBeforeFlash,
    showNonStableWarning,
    isFlashing = $bindable(false),
  }: Props = $props();

  let riskAcknowledgeStatus = $state<'none' | 'shown' | 'accepted'>('none');
  let progressName = $state<string | null>(null);
  let progressPercent = $state<number | null>(null);
  let error = $state<string | null>(null);

  async function FlashDeviceImpl() {
    if (!latestResponse || !board || !manager) {
      progressName = null;
      error = 'No device selected.';
      return;
    }

    const artifact = FindArtifact(latestResponse, board, 'merged');
    if (!artifact) {
      progressName = null;
      error = 'No merged firmware artifact found for this board.';
      return;
    }

    error = null;

    function progressCallback(progress: number) {
      if (!progressName) return;
      progressPercent = progress * 100;
    }

    progressName = 'Resetting...';
    progressPercent = null;
    await manager.ensureBootloader();

    progressName = 'Downloading firmware...';
    progressPercent = null;
    const firmware = await DownloadAndVerifyArtifact(artifact);
    if (!firmware) {
      progressName = null;
      error = 'Failed to download firmware.';
      return;
    }

    progressName = 'Flashing firmware...';
    progressPercent = null;
    await manager.flash(firmware, eraseBeforeFlash, progressCallback);

    progressName = 'Rebooting device... (Reconnect to power manually if stuck)';
    progressPercent = null;
    await manager.ensureApplication();

    progressName = 'Rebooted device! Flashing complete.';
    progressPercent = 100;
  }
  async function FlashDevice() {
    if (isFlashing) return;
    if (showNonStableWarning && riskAcknowledgeStatus !== 'accepted') {
      riskAcknowledgeStatus = 'shown';
      return;
    }
    try {
      isFlashing = true;
      await FlashDeviceImpl();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      isFlashing = false;
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
  <Button onclick={FlashDevice} disabled={!manager || isFlashing}>
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
