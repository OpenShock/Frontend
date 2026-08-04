import type { BackendInfoResponse } from '$lib/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function makeInfo(overrides: Partial<BackendInfoResponse> = {}): BackendInfoResponse {
  return {
    version: '1.0.0',
    commit: 'abc1234',
    currentTime: Temporal.Instant.from('2026-04-27T00:00:00Z'),
    frontendUrl: 'https://openshock.app',
    shortLinkUrl: 'https://shockl.ink',
    turnstileSiteKey: null,
    oAuthProviders: [],
    isMailEnabled: true,
    isUserAuthenticated: false,
    ...overrides,
  };
}

describe('backendMetadata', () => {
  // Reset module registry before each test so that module-level $state starts as null.
  beforeEach(() => {
    vi.resetModules();
  });

  it('state is null before set is called', async () => {
    const { backendMetadata } = await import('./backend-metadata-state.svelte');
    expect(backendMetadata.state).toBeNull();
  });

  it('set stores the backend info in state without isUserAuthenticated', async () => {
    const { backendMetadata } = await import('./backend-metadata-state.svelte');
    const info = makeInfo({ isUserAuthenticated: true });

    backendMetadata.set(info);

    const { isUserAuthenticated: _ignored, ...expected } = info;
    expect(backendMetadata.state).toEqual(expected);
    expect(backendMetadata.state).not.toHaveProperty('isUserAuthenticated');
  });

  it('second set call overwrites state with new data', async () => {
    const { backendMetadata } = await import('./backend-metadata-state.svelte');

    backendMetadata.set(makeInfo({ version: '1.0.0' }));
    backendMetadata.set(makeInfo({ version: '1.1.0' }));

    expect(backendMetadata.state?.version).toBe('1.1.0');
  });
});
