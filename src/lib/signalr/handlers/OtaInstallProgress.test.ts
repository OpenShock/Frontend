import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OtaUpdateProgressTask } from '$lib/signalr/models/OtaUpdateProgressTask';

const mockOnlineHubs = vi.hoisted(() => new Map<string, any>());

vi.mock('$lib/state/hubs-state.svelte', () => ({
  onlineHubs: mockOnlineHubs,
}));

vi.mock('svelte-sonner', () => ({ toast: { error: vi.fn() } }));

import { handleSignalrOtaInstallProgress } from './OtaInstallProgress';
import { toast } from 'svelte-sonner';

beforeEach(() => {
  mockOnlineHubs.clear();
  vi.mocked(toast.error).mockClear();
});

describe('handleSignalrOtaInstallProgress', () => {
  it('updates otaInstall when hub and updateId match', () => {
    const hub = { otaInstall: { id: 7, task: OtaUpdateProgressTask.FetchingMetadata, progress: 0 } };
    mockOnlineHubs.set('hub-1', hub);

    handleSignalrOtaInstallProgress('hub-1', 7, OtaUpdateProgressTask.FlashingApplication, 50);

    expect(hub.otaInstall).toEqual({
      id: 7,
      task: OtaUpdateProgressTask.FlashingApplication,
      progress: 50,
    });
  });

  it('is a no-op when the hub is not in onlineHubs', () => {
    handleSignalrOtaInstallProgress('unknown', 1, OtaUpdateProgressTask.Rebooting, 100);
    expect(vi.mocked(toast.error)).not.toHaveBeenCalled();
  });

  it('is a no-op when updateId does not match', () => {
    const hub = { otaInstall: { id: 5, task: OtaUpdateProgressTask.FetchingMetadata, progress: 10 } };
    mockOnlineHubs.set('hub-1', hub);

    handleSignalrOtaInstallProgress('hub-1', 99, OtaUpdateProgressTask.FlashingApplication, 80);

    expect(hub.otaInstall.id).toBe(5);
    expect(hub.otaInstall.progress).toBe(10);
  });

  it('is a no-op when hub has no otaInstall', () => {
    mockOnlineHubs.set('hub-1', { otaInstall: null });
    handleSignalrOtaInstallProgress('hub-1', 1, OtaUpdateProgressTask.Rebooting, 90);
    expect(vi.mocked(toast.error)).not.toHaveBeenCalled();
  });

  it('shows toast.error for non-string hubId', () => {
    handleSignalrOtaInstallProgress(42, 1, OtaUpdateProgressTask.Rebooting, 50);
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
  });

  it('shows toast.error for non-number updateId', () => {
    handleSignalrOtaInstallProgress('hub-1', 'bad', OtaUpdateProgressTask.Rebooting, 50);
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
  });

  it('shows toast.error for invalid task value', () => {
    handleSignalrOtaInstallProgress('hub-1', 1, 999, 50);
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
  });

  it('shows toast.error for non-number progress', () => {
    handleSignalrOtaInstallProgress('hub-1', 1, OtaUpdateProgressTask.Rebooting, 'done');
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
  });

  it('preserves other otaInstall fields when updating', () => {
    const hub = {
      otaInstall: { id: 3, version: '4.0.0', task: OtaUpdateProgressTask.FetchingMetadata, progress: 0 },
    };
    mockOnlineHubs.set('hub-1', hub);

    handleSignalrOtaInstallProgress('hub-1', 3, OtaUpdateProgressTask.FlashingFilesystem, 25);

    expect(hub.otaInstall.version).toBe('4.0.0');
    expect(hub.otaInstall.task).toBe(OtaUpdateProgressTask.FlashingFilesystem);
    expect(hub.otaInstall.progress).toBe(25);
  });
});
