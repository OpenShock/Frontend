import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/api', () => ({
  shockerSharesV2Api: {
    userSharesGetSharesByUsers: vi.fn(),
    userSharesGetOutgoingInvitesList: vi.fn(),
    userSharesGetIncomingInvitesList: vi.fn(),
  },
}));

vi.mock('$lib/errorhandling/apiErrorHandling', () => ({
  handleApiError: vi.fn(),
}));

describe('userSharesState initial values', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('shares starts as { outgoing: [], incoming: [] }', async () => {
    const { userSharesState } = await import('./user-shares-state.svelte');
    expect(userSharesState.shares).toEqual({ outgoing: [], incoming: [] });
  });

  it('outgoingInvites starts as empty array', async () => {
    const { userSharesState } = await import('./user-shares-state.svelte');
    expect(userSharesState.outgoingInvites).toEqual([]);
  });

  it('incomingInvites starts as empty array', async () => {
    const { userSharesState } = await import('./user-shares-state.svelte');
    expect(userSharesState.incomingInvites).toEqual([]);
  });

  it('shares setter updates the value', async () => {
    const { userSharesState } = await import('./user-shares-state.svelte');
    const newShares = { outgoing: [{ id: 'u1' } as any], incoming: [] };
    userSharesState.shares = newShares;
    expect(userSharesState.shares).toEqual(newShares);
  });
});

describe('refreshUserShares', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sets shares from API response', async () => {
    const { refreshUserShares, userSharesState } = await import('./user-shares-state.svelte');
    const { shockerSharesV2Api } = await import('$lib/api');
    const data = { outgoing: [{ id: 'u1' } as any], incoming: [] };
    vi.mocked(shockerSharesV2Api.userSharesGetSharesByUsers).mockResolvedValue(data as any);

    await refreshUserShares();
    expect(userSharesState.shares).toEqual(data);
  });

  it('calls handleApiError and rethrows on failure', async () => {
    const { refreshUserShares } = await import('./user-shares-state.svelte');
    const { shockerSharesV2Api } = await import('$lib/api');
    const { handleApiError } = await import('$lib/errorhandling/apiErrorHandling');
    const err = new Error('Fetch failed');
    vi.mocked(shockerSharesV2Api.userSharesGetSharesByUsers).mockRejectedValue(err);

    await expect(refreshUserShares()).rejects.toThrow('Fetch failed');
    expect(vi.mocked(handleApiError)).toHaveBeenCalledWith(err);
  });
});

describe('refreshOutgoingInvites', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sets outgoingInvites from API response', async () => {
    const { refreshOutgoingInvites, userSharesState } = await import('./user-shares-state.svelte');
    const { shockerSharesV2Api } = await import('$lib/api');
    const invite = { id: 'inv-1', code: 'ABC' };
    vi.mocked(shockerSharesV2Api.userSharesGetOutgoingInvitesList).mockResolvedValue([invite] as any);

    await refreshOutgoingInvites();
    expect(userSharesState.outgoingInvites).toEqual([invite]);
  });

  it('calls handleApiError and rethrows on failure', async () => {
    const { refreshOutgoingInvites } = await import('./user-shares-state.svelte');
    const { shockerSharesV2Api } = await import('$lib/api');
    const { handleApiError } = await import('$lib/errorhandling/apiErrorHandling');
    const err = new Error('Network error');
    vi.mocked(shockerSharesV2Api.userSharesGetOutgoingInvitesList).mockRejectedValue(err);

    await expect(refreshOutgoingInvites()).rejects.toThrow('Network error');
    expect(vi.mocked(handleApiError)).toHaveBeenCalledWith(err);
  });
});

describe('refreshIncomingInvites', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sets incomingInvites from API response', async () => {
    const { refreshIncomingInvites, userSharesState } = await import('./user-shares-state.svelte');
    const { shockerSharesV2Api } = await import('$lib/api');
    const invite = { id: 'inv-2', code: 'XYZ' };
    vi.mocked(shockerSharesV2Api.userSharesGetIncomingInvitesList).mockResolvedValue([invite] as any);

    await refreshIncomingInvites();
    expect(userSharesState.incomingInvites).toEqual([invite]);
  });

  it('calls handleApiError and rethrows on failure', async () => {
    const { refreshIncomingInvites } = await import('./user-shares-state.svelte');
    const { shockerSharesV2Api } = await import('$lib/api');
    const { handleApiError } = await import('$lib/errorhandling/apiErrorHandling');
    const err = new Error('Timeout');
    vi.mocked(shockerSharesV2Api.userSharesGetIncomingInvitesList).mockRejectedValue(err);

    await expect(refreshIncomingInvites()).rejects.toThrow('Timeout');
    expect(vi.mocked(handleApiError)).toHaveBeenCalledWith(err);
  });
});
