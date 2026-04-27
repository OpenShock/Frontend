<script lang="ts">
  import { Microchip, TriangleAlert } from '@lucide/svelte';
  import {
    DownloadAndVerifyArtifact,
    FindArtifact,
    type FirmwareRelease,
  } from '$lib/api/firmwareRepo';
  import { Button } from '$lib/components/ui/button';
  import { Progress } from '$lib/components/ui/progress';
  import RiskAcknowledgementModal from './RiskAcknowledgementModal.svelte';
  import type EspSerialConnection from './EspSerialConnection';

  interface Props {
    latestResponse: FirmwareRelease;
    board: string;
    connection: EspSerialConnection;
    eraseBeforeFlash: boolean;
    showNonStableWarning: boolean;
    isFlashing: boolean;
    onComplete?: () => void;
  }

  let {
    latestResponse,
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
    await connection.ensureBootloader();

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
    await connection.flash(firmware, eraseBeforeFlash, progressCallback);

    progressName = 'Rebooting device... (Reconnect to power manually if stuck)';
    progressPercent = null;
    await connection.ensureApplication();

    progressName = 'Rebooted device! Flashing complete.';
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
