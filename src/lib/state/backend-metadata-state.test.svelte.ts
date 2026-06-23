import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('backendMetadata', () => {
  // Reset module registry before each test so that module-level $state starts as null.
  beforeEach(() => {
    vi.resetModules();
  });

  it('state is null before set is called', async () => {
    const { backendMetadata } = await import('./backend-metadata-state.svelte');
    expect(backendMetadata.state).toBeNull();
  });

  it('set() stores the response without isUserAuthenticated', async () => {
    const { backendMetadata } = await import('./backend-metadata-state.svelte');
    const info = {
      version: '1.0.0',
      commit: 'abc123',
      currentTime: '2026-04-27T00:00:00Z',
      frontendUrl: 'https://example.com',
      shortLinkUrl: 'https://example.com/s',
      turnstileSiteKey: null,
      oAuthProviders: [],
      isUserAuthenticated: true,
    };

    backendMetadata.set(info as any);

    const { isUserAuthenticated: _ignored, ...rest } = info;
    expect(backendMetadata.state).toEqual(rest);
    expect(backendMetadata.state).not.toHaveProperty('isUserAuthenticated');
  });

  it('set() overwrites state with new data on a second call', async () => {
    const { backendMetadata } = await import('./backend-metadata-state.svelte');
    const first = {
      version: '1.0.0',
      commit: 'aaa',
      currentTime: '2026-01-01T00:00:00Z',
      frontendUrl: 'https://example.com',
      shortLinkUrl: 'https://example.com/s',
      turnstileSiteKey: null,
      oAuthProviders: [],
      isUserAuthenticated: false,
    };
    const second = {
      version: '1.1.0',
      commit: 'bbb',
      currentTime: '2026-04-27T00:00:00Z',
      frontendUrl: 'https://example.com',
      shortLinkUrl: 'https://example.com/s',
      turnstileSiteKey: null,
      oAuthProviders: [],
      isUserAuthenticated: true,
    };

    backendMetadata.set(first as any);
    backendMetadata.set(second as any);

    expect(backendMetadata.state?.version).toBe('1.1.0');
    expect(backendMetadata.state?.commit).toBe('bbb');
  });
});
