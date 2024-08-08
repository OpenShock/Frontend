<script lang="ts">
  import HashMD5 from 'crypto-js/md5';
  import WordArray from 'crypto-js/lib-typedarrays';
  import FlashManager from './FlashManager';
  import { DownloadFirmwareBinary, GetFirmwareBinaryHash } from './CDN';
  import { ProgressBar } from '@skeletonlabs/skeleton';

  export let version: string;
  export let board: string;
  export let manager: FlashManager;
  export let isFlashing: boolean = false;

  let eraseFlash: boolean = false;
  let progressName: string | null = null;
  let progressPercent: number | undefined = undefined;
  let error: string | null = null;

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
    await manager.flash(firmware, eraseFlash, progressCallback);

    progressName = 'Rebooting device... (Reconnect to power manually if stuck)';
    progressPercent = undefined;
    await manager.hardReset();

    progressName = 'Rebooted device! Flashing complete.';
    progressPercent = 100;
  }
  async function FlashDevice() {
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

<div class="flex flex-col items-stretch justify-start">
  <h3 class="h3 font-bold">Flashing</h3>
  <div class="flex flex-col items-start justify-start p-2 gap-1">
    <div class="flex flex-row items-center justify-start gap-2">
      <label class="flex items-center space-x-2">
        <input type="checkbox" class="checkbox" bind:checked={eraseFlash} />
        <p class="select-none">Erase everything before flashing</p>
      </label>
    </div>
  </div>

  <!-- Flash button -->
  <button
    class="btn variant-filled-primary gap-2"
    on:click={FlashDevice}
    disabled={!manager || isFlashing}
  >
    <i class="fa fa-microchip" />
    Flash
  </button>

  <!-- Flash progress -->
  <div class="flex flex-col items-start justify-start gap-2 p-2">
    {#if error}
      <div class="flex flex-row items-center justify-start gap-2">
        <i class="fa fa-exclamation-triangle text-red-500" />
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
        <ProgressBar label="Progress Bar" value={progressPercent} max={100} />
      {/if}
    {/if}
  </div>
</div>
