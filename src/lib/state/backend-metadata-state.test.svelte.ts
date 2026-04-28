import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock $lib/api before any module loads. vi.mock is hoisted automatically.
// The factory is re-called after each vi.resetModules(), so each test gets fresh vi.fn()s.
vi.mock('$lib/api', () => ({
  metaApi: {
    versionGetBackendInfo: vi.fn(),
  },
}));

describe('backendMetadata', () => {
  // Reset module registry before each test so that module-level $state starts as null.
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('state is null before init is called', async () => {
    const { backendMetadata } = await import('./backend-metadata-state.svelte');
    expect(backendMetadata.state).toBeNull();
  });

  it('init stores the API response in state', async () => {
    const { backendMetadata } = await import('./backend-metadata-state.svelte');
    const { metaApi } = await import('$lib/api');
    const mockData = { version: '1.0.0', currentTime: '2026-04-27T00:00:00Z' };
    vi.mocked(metaApi.versionGetBackendInfo).mockResolvedValue({ data: mockData });

    await backendMetadata.init();

    expect(backendMetadata.state).toEqual(mockData);
  });

  it('init returns the fetched backend info', async () => {
    const { backendMetadata } = await import('./backend-metadata-state.svelte');
    const { metaApi } = await import('$lib/api');
    const mockData = { version: '2.0.0', currentTime: '2026-04-27T00:00:00Z' };
    vi.mocked(metaApi.versionGetBackendInfo).mockResolvedValue({ data: mockData });

    const result = await backendMetadata.init();

    expect(result).toEqual(mockData);
  });

  it('init throws when response.data is null', async () => {
    const { backendMetadata } = await import('./backend-metadata-state.svelte');
    const { metaApi } = await import('$lib/api');
    vi.mocked(metaApi.versionGetBackendInfo).mockResolvedValue({
      data: null,
      message: 'Service unavailable',
    });

    await expect(backendMetadata.init()).rejects.toThrow(
      'Failed to get backend info: Service unavailable',
    );
  });

  it('init throws when response.data is undefined', async () => {
    const { backendMetadata } = await import('./backend-metadata-state.svelte');
    const { metaApi } = await import('$lib/api');
    vi.mocked(metaApi.versionGetBackendInfo).mockResolvedValue({ data: undefined });

    await expect(backendMetadata.init()).rejects.toThrow('Failed to get backend info');
  });

  it('state remains null if init throws', async () => {
    const { backendMetadata } = await import('./backend-metadata-state.svelte');
    const { metaApi } = await import('$lib/api');
    vi.mocked(metaApi.versionGetBackendInfo).mockResolvedValue({ data: null, message: 'Oops' });

    await backendMetadata.init().catch(() => {});

    expect(backendMetadata.state).toBeNull();
  });

  it('second init call overwrites state with new data', async () => {
    const { backendMetadata } = await import('./backend-metadata-state.svelte');
    const { metaApi } = await import('$lib/api');
    const first = { version: '1.0.0', currentTime: '2026-01-01T00:00:00Z' };
    const second = { version: '1.1.0', currentTime: '2026-04-27T00:00:00Z' };
    vi.mocked(metaApi.versionGetBackendInfo)
      .mockResolvedValueOnce({ data: first })
      .mockResolvedValueOnce({ data: second });

    await backendMetadata.init();
    await backendMetadata.init();

    expect(backendMetadata.state).toEqual(second);
  });
});
