import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/api', () => ({
  shockersV1Api: { shockerListSharedShockers: vi.fn() },
}));

vi.mock('$lib/errorhandling/apiErrorHandling', () => ({
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
    const { shockersV1Api } = await import('$lib/api');
    const hub = { id: 'shared-1', name: 'Shared Hub', shockers: [] };
    vi.mocked(shockersV1Api.shockerListSharedShockers).mockResolvedValue({ data: [hub] });

    await refreshSharedHubs();

    expect(sharedHubsState.value).toEqual([hub]);
  });

  it('replaces existing value on re-fetch', async () => {
    const { refreshSharedHubs, sharedHubsState } = await import('./shared-hubs-state.svelte');
    const { shockersV1Api } = await import('$lib/api');
    vi.mocked(shockersV1Api.shockerListSharedShockers)
      .mockResolvedValueOnce({ data: [{ id: 'old', name: 'Old', shockers: [] }] })
      .mockResolvedValueOnce({ data: [{ id: 'new', name: 'New', shockers: [] }] });

    await refreshSharedHubs();
    await refreshSharedHubs();

    expect(sharedHubsState.value).toHaveLength(1);
    expect(sharedHubsState.value[0].id).toBe('new');
  });

  it('throws and calls handleApiError when response has no data', async () => {
    const { refreshSharedHubs } = await import('./shared-hubs-state.svelte');
    const { shockersV1Api } = await import('$lib/api');
    const { handleApiError } = await import('$lib/errorhandling/apiErrorHandling');
    vi.mocked(shockersV1Api.shockerListSharedShockers).mockResolvedValue({
      data: null,
      message: 'Forbidden',
    });

    await expect(refreshSharedHubs()).rejects.toThrow('Failed to fetch shared devices');
    expect(vi.mocked(handleApiError)).toHaveBeenCalled();
  });

  it('throws and calls handleApiError when API rejects', async () => {
    const { refreshSharedHubs } = await import('./shared-hubs-state.svelte');
    const { shockersV1Api } = await import('$lib/api');
    const { handleApiError } = await import('$lib/errorhandling/apiErrorHandling');
    const err = new Error('Network error');
    vi.mocked(shockersV1Api.shockerListSharedShockers).mockRejectedValue(err);

    await expect(refreshSharedHubs()).rejects.toThrow('Network error');
    expect(vi.mocked(handleApiError)).toHaveBeenCalledWith(err);
  });

  it('populates multiple shared hubs', async () => {
    const { refreshSharedHubs, sharedHubsState } = await import('./shared-hubs-state.svelte');
    const { shockersV1Api } = await import('$lib/api');
    vi.mocked(shockersV1Api.shockerListSharedShockers).mockResolvedValue({
      data: [
        { id: 'sh-1', name: 'Alpha', shockers: [] },
        { id: 'sh-2', name: 'Beta', shockers: [] },
      ],
    });

    await refreshSharedHubs();
    expect(sharedHubsState.value).toHaveLength(2);
  });
});
