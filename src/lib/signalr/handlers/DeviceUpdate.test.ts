import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRefreshOwnHubs = vi.hoisted(() => vi.fn());

vi.mock('$lib/state/hubs-state.svelte', () => ({
  refreshOwnHubs: mockRefreshOwnHubs,
}));

vi.mock('svelte-sonner', () => ({ toast: { error: vi.fn() } }));

import { handleSignalrDeviceUpdate } from './DeviceUpdate';
import { toast } from 'svelte-sonner';

beforeEach(() => {
  mockRefreshOwnHubs.mockClear();
  vi.mocked(toast.error).mockClear();
});

describe('handleSignalrDeviceUpdate', () => {
  it('calls refreshOwnHubs for a valid HubUpdated event', () => {
    handleSignalrDeviceUpdate('hub-1', 1 /* HubUpdated */);
    expect(mockRefreshOwnHubs).toHaveBeenCalledOnce();
  });

  it('calls refreshOwnHubs for HubCreated', () => {
    handleSignalrDeviceUpdate('hub-1', 0 /* HubCreated */);
    expect(mockRefreshOwnHubs).toHaveBeenCalledOnce();
  });

  it('calls refreshOwnHubs for HubDeleted', () => {
    handleSignalrDeviceUpdate('hub-1', 3 /* HubDeleted */);
    expect(mockRefreshOwnHubs).toHaveBeenCalledOnce();
  });

  it('calls refreshOwnHubs for HubShockersUpdate', () => {
    handleSignalrDeviceUpdate('hub-1', 2 /* HubShockersUpdate */);
    expect(mockRefreshOwnHubs).toHaveBeenCalledOnce();
  });

  it('shows toast.error and skips refresh for invalid deviceId (number)', () => {
    handleSignalrDeviceUpdate(42, 1);
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
    expect(mockRefreshOwnHubs).not.toHaveBeenCalled();
  });

  it('shows toast.error and skips refresh for invalid updateType', () => {
    handleSignalrDeviceUpdate('hub-1', 999);
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
    expect(mockRefreshOwnHubs).not.toHaveBeenCalled();
  });

  it('shows toast.error when both arguments are invalid', () => {
    handleSignalrDeviceUpdate(null, null);
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
    expect(mockRefreshOwnHubs).not.toHaveBeenCalled();
  });
});
