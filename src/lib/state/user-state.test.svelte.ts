import type { ApiUserSelf } from '$lib/types/ApiUser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/api', () => ({
  usersGetSelf: vi.fn(),
}));

vi.mock('$lib/errorhandling/apiErrorHandling', () => ({
  handleApiError: vi.fn(),
}));

function makeSelf(overrides: Partial<ApiUserSelf> = {}): ApiUserSelf {
  return {
    id: 'u1',
    name: 'Alice',
    avatar: '',
    roles: [],
    email: 'alice@example.com',
    hasPassword: true,
    ...overrides,
  };
}

describe('userState', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('starts with loading=true, self=null, all=[]', async () => {
    const { userState } = await import('./user-state.svelte');
    expect(userState.loading).toBe(true);
    expect(userState.self).toBeNull();
    expect(userState.all).toEqual([]);
  });

  it('reset() sets loading=false and clears self and all', async () => {
    const { userState } = await import('./user-state.svelte');
    userState.reset();
    expect(userState.loading).toBe(false);
    expect(userState.self).toBeNull();
    expect(userState.all).toEqual([]);
  });

  it('setSelf() sets the self user', async () => {
    const { userState } = await import('./user-state.svelte');
    const user = makeSelf();
    userState.setSelf(user);
    expect(userState.self).toEqual(user);
  });

  it('setSelf() with new data replaces the previous self', async () => {
    const { userState } = await import('./user-state.svelte');
    const original = makeSelf({ name: 'Old', email: 'old@example.com' });
    userState.setSelf(original);
    const updated = { ...original, name: 'Alice' };
    userState.setSelf(updated);
    expect(userState.self?.name).toBe('Alice');
  });

  it('setSelfName() updates name on self', async () => {
    const { userState } = await import('./user-state.svelte');
    userState.setSelf(makeSelf());
    userState.setSelfName('Bob');
    expect(userState.self?.name).toBe('Bob');
  });

  it('setSelfName() is a no-op when self is null', async () => {
    const { userState } = await import('./user-state.svelte');
    expect(() => userState.setSelfName('Bob')).not.toThrow();
    expect(userState.self).toBeNull();
  });

  it('setSelfEmail() updates email on self', async () => {
    const { userState } = await import('./user-state.svelte');
    userState.setSelf(makeSelf());
    userState.setSelfEmail('new@example.com');
    expect(userState.self?.email).toBe('new@example.com');
  });

  it('setSelfEmail() is a no-op when self is null', async () => {
    const { userState } = await import('./user-state.svelte');
    expect(() => userState.setSelfEmail('x@y.com')).not.toThrow();
    expect(userState.self).toBeNull();
  });
});

describe('userState.refreshSelf', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns true and sets self on successful API response', async () => {
    const { userState } = await import('./user-state.svelte');
    const { usersGetSelf } = await import('$lib/api');
    vi.mocked(usersGetSelf).mockResolvedValue({
      data: {
        id: 'u1',
        name: 'Alice',
        image: 'avatar.png',
        roles: [],
        email: 'alice@example.com',
        hasPassword: true,
      },
    } as any);

    const result = await userState.refreshSelf();

    expect(result).toBe(true);
    expect(userState.loading).toBe(false);
    expect(userState.self).toMatchObject({ id: 'u1', name: 'Alice' });
  });

  it('maps image field to avatar', async () => {
    const { userState } = await import('./user-state.svelte');
    const { usersGetSelf } = await import('$lib/api');
    vi.mocked(usersGetSelf).mockResolvedValue({
      data: {
        id: 'u1',
        name: 'Alice',
        image: 'avatar.png',
        roles: [],
        email: 'alice@example.com',
        hasPassword: true,
      },
    } as any);

    await userState.refreshSelf();
    expect(userState.self?.avatar).toBe('avatar.png');
  });

  it('returns false and calls reset() when response has no data', async () => {
    const { userState } = await import('./user-state.svelte');
    const { usersGetSelf } = await import('$lib/api');
    vi.mocked(usersGetSelf).mockResolvedValue({
      data: null,
      message: 'Unauthorized',
    } as any);

    const result = await userState.refreshSelf();

    expect(result).toBe(false);
    expect(userState.self).toBeNull();
    expect(userState.loading).toBe(false);
  });

  it('returns false and calls handleApiError when API throws', async () => {
    const { userState } = await import('./user-state.svelte');
    const { usersGetSelf } = await import('$lib/api');
    const { handleApiError } = await import('$lib/errorhandling/apiErrorHandling');
    const err = new Error('Network failure');
    vi.mocked(usersGetSelf).mockRejectedValue(err);

    const result = await userState.refreshSelf();

    expect(result).toBe(false);
    expect(userState.self).toBeNull();
    expect(vi.mocked(handleApiError)).toHaveBeenCalledWith(err, expect.any(Function));
  });

  it('a second refreshSelf overwrites self with new data', async () => {
    const { userState } = await import('./user-state.svelte');
    const { usersGetSelf } = await import('$lib/api');

    const base = { id: 'u1', image: '', roles: [], email: 'a@b.com', hasPassword: true };
    vi.mocked(usersGetSelf)
      .mockResolvedValueOnce({ data: { ...base, name: 'OldName' } } as any)
      .mockResolvedValueOnce({ data: { ...base, name: 'NewName' } } as any);

    await userState.refreshSelf();
    await userState.refreshSelf();

    expect(userState.self?.name).toBe('NewName');
  });
});
