import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockOnlineHubs = vi.hoisted(() => new Map<string, any>());

vi.mock('$lib/state/hubs-state.svelte', () => ({
  onlineHubs: mockOnlineHubs,
}));

vi.mock('svelte-sonner', () => ({ toast: { error: vi.fn(), warning: vi.fn() } }));

import { handleSignalrOtaRollback } from './OtaRollback';
import { toast } from 'svelte-sonner';

beforeEach(() => {
  mockOnlineHubs.clear();
  vi.mocked(toast.error).mockClear();
  vi.mocked(toast.warning).mockClear();
});

describe('handleSignalrOtaRollback', () => {
  it('sets otaInstall to null and otaResult to failed when hub and updateId match', () => {
    const hub = {
      otaInstall: { id: 5, task: 0, progress: 80 },
      otaResult: null,
    };
    mockOnlineHubs.set('hub-1', hub);

    handleSignalrOtaRollback('hub-1', 5);

    expect(hub.otaInstall).toBeNull();
    expect(hub.otaResult).toEqual({
      success: false,
      message: 'Device rolled back to previous version',
    });
  });

  it('always shows toast.warning regardless of hub presence', () => {
    handleSignalrOtaRollback('hub-1', 1);
    expect(vi.mocked(toast.warning)).toHaveBeenCalled();
  });

  it('is a no-op on hub state when hub is not found', () => {
    handleSignalrOtaRollback('nonexistent', 1);
    expect(vi.mocked(toast.error)).not.toHaveBeenCalled();
  });

  it('is a no-op on hub state when updateId does not match', () => {
    const hub = { otaInstall: { id: 7, task: 0, progress: 50 }, otaResult: null };
    mockOnlineHubs.set('hub-1', hub);

    handleSignalrOtaRollback('hub-1', 99);

    expect(hub.otaInstall).not.toBeNull();
    expect(hub.otaResult).toBeNull();
  });

  it('shows toast.error for non-string hubId', () => {
    handleSignalrOtaRollback(42, 1);
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
  });

  it('shows toast.error for non-number updateId', () => {
    handleSignalrOtaRollback('hub-1', 'bad');
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
  });
});
