import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/api', () => ({
  shockersV1Api: { shockerListShockers: vi.fn() },
}));

vi.mock('$lib/errorhandling/apiErrorHandling', () => ({
  handleApiError: vi.fn(),
}));

describe('HubOnlineState', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('constructor sets all fields', async () => {
    const { HubOnlineState } = await import('./hubs-state.svelte');
    const hub = new HubOnlineState('hub-1', true, '4.0.0');
    expect(hub.hubId).toBe('hub-1');
    expect(hub.isOnline).toBe(true);
    expect(hub.firmwareVersion).toBe('4.0.0');
    expect(hub.otaInstall).toBeNull();
    expect(hub.otaResult).toBeNull();
  });

  it('isOnline=false when constructed offline', async () => {
    const { HubOnlineState } = await import('./hubs-state.svelte');
    const hub = new HubOnlineState('hub-2', false, null);
    expect(hub.isOnline).toBe(false);
  });

  it('firmwareVersion can be null', async () => {
    const { HubOnlineState } = await import('./hubs-state.svelte');
    const hub = new HubOnlineState('hub-3', true, null);
    expect(hub.firmwareVersion).toBeNull();
  });

  it('otaInstall is independently mutable', async () => {
    const { HubOnlineState } = await import('./hubs-state.svelte');
    const hub = new HubOnlineState('hub-4', true, '3.0.0');
    hub.otaInstall = { id: 1, version: '4.0.0', task: 'Installing' as any, progress: 50 };
    expect(hub.otaInstall?.progress).toBe(50);
    expect(hub.otaResult).toBeNull();
  });
});

describe('ownHubs / onlineHubs', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('ownHubs starts empty', async () => {
    const { ownHubs } = await import('./hubs-state.svelte');
    expect(ownHubs.size).toBe(0);
  });

  it('onlineHubs starts empty', async () => {
    const { onlineHubs } = await import('./hubs-state.svelte');
    expect(onlineHubs.size).toBe(0);
  });
});

describe('refreshOwnHubs', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('populates ownHubs from API response', async () => {
    const { refreshOwnHubs, ownHubs } = await import('./hubs-state.svelte');
    const { shockersV1Api } = await import('$lib/api');
    const hub = { id: 'hub-1', name: 'Hub One', shockers: [] };
    vi.mocked(shockersV1Api.shockerListShockers).mockResolvedValue({ data: [hub] });

    await refreshOwnHubs();

    expect(ownHubs.size).toBe(1);
    expect(ownHubs.get('hub-1')).toEqual(hub);
  });

  it('populates multiple hubs', async () => {
    const { refreshOwnHubs, ownHubs } = await import('./hubs-state.svelte');
    const { shockersV1Api } = await import('$lib/api');
    vi.mocked(shockersV1Api.shockerListShockers).mockResolvedValue({
      data: [
        { id: 'hub-1', name: 'First', shockers: [] },
        { id: 'hub-2', name: 'Second', shockers: [] },
      ],
    });

    await refreshOwnHubs();

    expect(ownHubs.size).toBe(2);
  });

  it('clears old entries on re-fetch', async () => {
    const { refreshOwnHubs, ownHubs } = await import('./hubs-state.svelte');
    const { shockersV1Api } = await import('$lib/api');
    vi.mocked(shockersV1Api.shockerListShockers)
      .mockResolvedValueOnce({ data: [{ id: 'hub-1', name: 'Old', shockers: [] }] })
      .mockResolvedValueOnce({ data: [{ id: 'hub-2', name: 'New', shockers: [] }] });

    await refreshOwnHubs();
    await refreshOwnHubs();

    expect(ownHubs.has('hub-1')).toBe(false);
    expect(ownHubs.has('hub-2')).toBe(true);
  });

  it('calls handleApiError and resolves when response has no data', async () => {
    const { refreshOwnHubs } = await import('./hubs-state.svelte');
    const { shockersV1Api } = await import('$lib/api');
    const { handleApiError } = await import('$lib/errorhandling/apiErrorHandling');
    vi.mocked(shockersV1Api.shockerListShockers).mockResolvedValue({ data: null });

    await expect(refreshOwnHubs()).resolves.toBeUndefined();
    expect(vi.mocked(handleApiError)).toHaveBeenCalled();
  });

  it('calls handleApiError and resolves when API throws', async () => {
    const { refreshOwnHubs } = await import('./hubs-state.svelte');
    const { shockersV1Api } = await import('$lib/api');
    const { handleApiError } = await import('$lib/errorhandling/apiErrorHandling');
    vi.mocked(shockersV1Api.shockerListShockers).mockRejectedValue(new Error('Network'));

    await expect(refreshOwnHubs()).resolves.toBeUndefined();
    expect(vi.mocked(handleApiError)).toHaveBeenCalled();
  });
});
