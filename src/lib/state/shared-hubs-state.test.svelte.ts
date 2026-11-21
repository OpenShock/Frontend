import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('#lib/api/index.js', () => ({
  shockerListSharedShockers: vi.fn(),
}));

vi.mock('#lib/errorhandling/apiErrorHandling.js', () => ({
  handleApiError: vi.fn(),
}));

describe('sharedHubsState', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('starts with an empty array', async () => {
    const { sharedHubsState } = await import('./shared-hubs-state.svelte');
    expect(sharedHubsState.value).toEqual([]);
  });
});

describe('refreshSharedHubs', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('populates sharedHubsState.value from API response', async () => {
    const { refreshSharedHubs, sharedHubsState } = await import('./shared-hubs-state.svelte');
    const hub = { id: 'shared-1', name: 'Shared Hub', image: '', devices: [] };
    vi.mocked((await import('#lib/api/index.js')).shockerListSharedShockers).mockResolvedValue({
      data: [hub],
    } as any);

    await refreshSharedHubs();

    expect(sharedHubsState.value).toEqual([hub]);
  });

  it('replaces existing value on re-fetch', async () => {
    const { refreshSharedHubs, sharedHubsState } = await import('./shared-hubs-state.svelte');
    vi.mocked((await import('#lib/api/index.js')).shockerListSharedShockers)
      .mockResolvedValueOnce({ data: [{ id: 'old', name: 'Old', image: '', devices: [] }] } as any)
      .mockResolvedValueOnce({ data: [{ id: 'new', name: 'New', image: '', devices: [] }] } as any);

    await refreshSharedHubs();
    await refreshSharedHubs();

    expect(sharedHubsState.value).toHaveLength(1);
    expect(sharedHubsState.value[0].id).toBe('new');
  });

  it('throws and calls handleApiError when response has no data', async () => {
    const { refreshSharedHubs } = await import('./shared-hubs-state.svelte');
    const { handleApiError } = await import('#lib/errorhandling/apiErrorHandling.js');
    vi.mocked((await import('#lib/api/index.js')).shockerListSharedShockers).mockResolvedValue({
      // The generated client types `data` as present; this exercises the guard for
      // the error shape the backend can still return.
      data: null,
      message: 'Forbidden',
    } as never);

    await expect(refreshSharedHubs()).rejects.toThrow('Failed to fetch shared devices');
    expect(vi.mocked(handleApiError)).toHaveBeenCalled();
  });

  it('throws and calls handleApiError when API rejects', async () => {
    const { refreshSharedHubs } = await import('./shared-hubs-state.svelte');
    const { handleApiError } = await import('#lib/errorhandling/apiErrorHandling.js');
    const err = new Error('Network error');
    vi.mocked((await import('#lib/api/index.js')).shockerListSharedShockers).mockRejectedValue(err);

    await expect(refreshSharedHubs()).rejects.toThrow('Network error');
    expect(vi.mocked(handleApiError)).toHaveBeenCalledWith(err);
  });

  it('populates multiple shared hubs', async () => {
    const { refreshSharedHubs, sharedHubsState } = await import('./shared-hubs-state.svelte');
    vi.mocked((await import('#lib/api/index.js')).shockerListSharedShockers).mockResolvedValue({
      data: [
        { id: 'sh-1', name: 'Alpha', image: '', devices: [] },
        { id: 'sh-2', name: 'Beta', image: '', devices: [] },
      ],
    } as any);

    await refreshSharedHubs();
    expect(sharedHubsState.value).toHaveLength(2);
  });
});
