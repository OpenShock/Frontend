<script lang="ts">
  import { Progress } from '$lib/components/ui/progress';
  import WordArray from 'crypto-js/lib-typedarrays';
  import HashMD5 from 'crypto-js/md5';
  import { DownloadFirmwareBinary, GetFirmwareBinaryHash } from '$lib/api/firmwareCDN';
  import FlashManager from '$lib/EspTool/FlashManager';
  import { Button } from '$lib/components/ui/button';

  import { Microchip, TriangleAlert } from '@lucide/svelte';

  interface Props {
    version: string;
    board: string;
    manager: FlashManager;
    eraseBeforeFlash: boolean;
    isFlashing?: boolean;
  }

  let {
    version,
    board,
    manager,
    eraseBeforeFlash,
    isFlashing = $bindable(false),
  }: Props = $props();

  let progressName = $state<string | null>(null);
  let progressPercent = $state<number | undefined>(undefined);
  let error = $state<string | null>(null);

  async function FlashDeviceImpl() {
    if (!version || !board || !manager) {
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
    progressPercent = undefined;
    await manager.ensureBootloader();

    progressName = 'Downloading firmware...';
    progressPercent = undefined;
    const firmware = await DownloadFirmwareBinary(version, board, progressCallback);
    if (!firmware) {
      progressName = null;
      error = 'Failed to download firmware.';
      return;
    }

    progressName = 'Fetching firmware hash...';
    progressPercent = undefined;
    const firmwareHash = await GetFirmwareBinaryHash(version, board);
    if (!firmwareHash) {
      progressName = null;
      error = 'Failed to get firmware hash.';
      return;
    }

    progressName = 'Verifying firmware hash...';
    progressPercent = undefined;
    const firmwareHashVerified = HashMD5(WordArray.create(firmware)).toString();
    if (firmwareHashVerified !== firmwareHash) {
      progressName = null;
      error = 'Firmware hash verification failed.';
      return;
    }

    progressName = 'Flashing firmware...';
    progressPercent = undefined;
    await manager.flash(firmware, eraseBeforeFlash, progressCallback);

    progressName = 'Rebooting device... (Reconnect to power manually if stuck)';
    progressPercent = undefined;
    await manager.ensureApplication();

    progressName = 'Rebooted device! Flashing complete.';
    progressPercent = 100;
  }
  async function FlashDevice() {
    if (isFlashing) return;
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
        {#if progressPercent !== undefined}
          ({progressPercent.toFixed(2)}%)
        {/if}
      </span>
      {#if progressName !== null}
        <Progress value={progressPercent} max={100} />
      {/if}
    {/if}
  </div>
</div>
