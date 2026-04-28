import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockOnlineHubs = vi.hoisted(() => new Map<string, any>());

vi.mock('$lib/state/hubs-state.svelte', () => {
  class HubOnlineState {
    hubId: string;
    isOnline: boolean;
    firmwareVersion: string | null;
    otaInstall = null;
    otaResult = null;
    constructor(id: string, online: boolean, firmware: string | null) {
      this.hubId = id;
      this.isOnline = online;
      this.firmwareVersion = firmware;
    }
  }
  return { onlineHubs: mockOnlineHubs, HubOnlineState };
});

vi.mock('svelte-sonner', () => ({ toast: { error: vi.fn() } }));

import { handleSignalrDeviceStatus } from './DeviceStatus';
import { toast } from 'svelte-sonner';

beforeEach(() => {
  mockOnlineHubs.clear();
  vi.mocked(toast.error).mockClear();
});

describe('handleSignalrDeviceStatus', () => {
  it('creates a new HubOnlineState for an unknown device', () => {
    handleSignalrDeviceStatus([{ device: 'hub-1', online: true, firmwareVersion: '4.0.0' }]);
    const hub = mockOnlineHubs.get('hub-1');
    expect(hub).toBeDefined();
    expect(hub.hubId).toBe('hub-1');
    expect(hub.isOnline).toBe(true);
    expect(hub.firmwareVersion).toBe('4.0.0');
  });

  it('updates an existing hub without creating a new instance', () => {
    const existing = { isOnline: false, firmwareVersion: null };
    mockOnlineHubs.set('hub-1', existing);

    handleSignalrDeviceStatus([{ device: 'hub-1', online: true, firmwareVersion: '4.1.0' }]);

    // Same reference — no new object created
    expect(mockOnlineHubs.get('hub-1')).toBe(existing);
    expect(existing.isOnline).toBe(true);
    expect(existing.firmwareVersion).toBe('4.1.0');
  });

  it('handles multiple entries in one call', () => {
    handleSignalrDeviceStatus([
      { device: 'hub-1', online: true, firmwareVersion: null },
      { device: 'hub-2', online: false, firmwareVersion: '3.0.0' },
    ]);
    expect(mockOnlineHubs.size).toBe(2);
  });

  it('accepts null firmwareVersion', () => {
    handleSignalrDeviceStatus([{ device: 'hub-1', online: true, firmwareVersion: null }]);
    expect(mockOnlineHubs.get('hub-1')?.firmwareVersion).toBeNull();
  });

  it('shows toast.error and returns early for non-array input', () => {
    handleSignalrDeviceStatus('not-an-array');
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
    expect(mockOnlineHubs.size).toBe(0);
  });

  it('shows toast.error for array containing invalid entry', () => {
    handleSignalrDeviceStatus([{ device: 123, online: true, firmwareVersion: null }]);
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
    expect(mockOnlineHubs.size).toBe(0);
  });

  it('shows toast.error for entry with missing required fields', () => {
    handleSignalrDeviceStatus([{ device: 'hub-1' }]);
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
  });

  it('processes empty array without error or toast', () => {
    handleSignalrDeviceStatus([]);
    expect(mockOnlineHubs.size).toBe(0);
    expect(vi.mocked(toast.error)).not.toHaveBeenCalled();
  });
});
