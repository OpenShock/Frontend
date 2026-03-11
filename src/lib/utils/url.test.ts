import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks for SvelteKit modules
// ---------------------------------------------------------------------------

const mocks = {
  base: '',
  asset: (p: string) => p,
  match: vi.fn<(path: string) => Promise<string | null>>().mockResolvedValue(null),
  goto: vi.fn<(url: string) => Promise<void>>().mockResolvedValue(undefined),
  replaceState: vi.fn(),
  page: {
    url: new URL('https://openshock.app/login'),
  },
  PUBLIC_BACKEND_API_URL: 'https://api.openshock.app/',
  PUBLIC_SITE_URL: 'https://openshock.app/',
  PUBLIC_SITE_SHORT_URL: 'https://shockl.ink/',
};

vi.mock('$app/paths', () => ({
  get base() {
    return mocks.base;
  },
  asset: (p: string) => mocks.asset(p),
  match: (p: string) => mocks.match(p),
}));

vi.mock('$app/navigation', () => ({
  goto: (...args: unknown[]) => mocks.goto(args[0] as string),
  replaceState: (...args: unknown[]) => mocks.replaceState(args[0], args[1]),
}));

vi.mock('svelte-sonner', () => ({
  toast: {},
}));

vi.mock('$app/state', () => ({
  get page() {
    return mocks.page;
  },
}));

vi.mock('$env/static/public', () => ({
  get PUBLIC_BACKEND_API_URL() {
    return mocks.PUBLIC_BACKEND_API_URL;
  },
  get PUBLIC_SITE_URL() {
    return mocks.PUBLIC_SITE_URL;
  },
  get PUBLIC_SITE_SHORT_URL() {
    return mocks.PUBLIC_SITE_SHORT_URL;
  },
}));

// Import after mocks are set up
const {
  getBackendURL,
  prefixBase,
  getSiteURL,
  getSiteAssetURL,
  getSiteShortURL,
  isValidRedirectURL,
  isValidRedirectParam,
  sanitizeRedirectSearchParam,
  gotoQueryRedirectOrFallback,
} = await import('./url');

// ---------------------------------------------------------------------------
// getBackendURL
// ---------------------------------------------------------------------------

describe('getBackendURL', () => {
  beforeEach(() => {
    mocks.PUBLIC_BACKEND_API_URL = 'https://api.openshock.app/';
  });

  it('returns the base URL when no path is given', () => {
    const url = getBackendURL();
    expect(url.href).toBe('https://api.openshock.app/');
  });

  it('appends a version-only path', () => {
    const url = getBackendURL('1');
    expect(url.pathname).toBe('/1');
  });

  it('appends a version-prefixed path', () => {
    const url = getBackendURL('2/account/login');
    expect(url.pathname).toBe('/2/account/login');
  });

  it('handles base URL without trailing slash', () => {
    mocks.PUBLIC_BACKEND_API_URL = 'https://api.openshock.app';
    const url = getBackendURL('1/hubs/user');
    expect(url.pathname).toBe('/1/hubs/user');
  });

  it('handles base URL with a sub-path', () => {
    mocks.PUBLIC_BACKEND_API_URL = 'https://example.com/api/v1/';
    const url = getBackendURL('2/account');
    expect(url.pathname).toBe('/api/v1/2/account');
  });

  it('returns a mutable URL object (search params can be added)', () => {
    const url = getBackendURL('1/oauth/discord/authorize');
    url.searchParams.set('flow', 'LoginOrCreate');
    expect(url.searchParams.get('flow')).toBe('LoginOrCreate');
    expect(url.href).toContain('?flow=LoginOrCreate');
  });

  it('throws for non-HTTPS URLs', () => {
    mocks.PUBLIC_BACKEND_API_URL = 'http://api.openshock.app/';
    expect(() => getBackendURL()).toThrow('HTTPS');
  });

  it('throws when the base URL contains query parameters', () => {
    mocks.PUBLIC_BACKEND_API_URL = 'https://api.openshock.app/?key=val';
    expect(() => getBackendURL()).toThrow('query parameters or hash');
  });

  it('throws when the base URL contains a hash', () => {
    mocks.PUBLIC_BACKEND_API_URL = 'https://api.openshock.app/#section';
    expect(() => getBackendURL()).toThrow('query parameters or hash');
  });
});

// ---------------------------------------------------------------------------
// prefixBase
// ---------------------------------------------------------------------------

describe('prefixBase', () => {
  afterEach(() => {
    mocks.base = '';
  });

  it('returns the path as-is when base is empty', () => {
    mocks.base = '';
    expect(prefixBase('/settings/account' as never)).toBe('/settings/account');
  });

  it('prepends the base path', () => {
    mocks.base = '/app';
    expect(prefixBase('/settings' as never)).toBe('/app/settings');
  });
});

// ---------------------------------------------------------------------------
// getSiteURL
// ---------------------------------------------------------------------------

describe('getSiteURL', () => {
  beforeEach(() => {
    mocks.base = '';
    mocks.PUBLIC_SITE_URL = 'https://openshock.app/';
  });

  it('builds a URL from a pathname', () => {
    const url = getSiteURL('/shockers/own' as never);
    expect(url.href).toBe('https://openshock.app/shockers/own');
  });

  it('appends search params', () => {
    const params = new URLSearchParams({ foo: 'bar', baz: '1' });
    const url = getSiteURL('/path' as never, params);
    expect(url.searchParams.get('foo')).toBe('bar');
    expect(url.searchParams.get('baz')).toBe('1');
  });

  it('respects the base path', () => {
    mocks.base = '/app';
    const url = getSiteURL('/home' as never);
    expect(url.pathname).toBe('/app/home');
  });

  it('works without search params', () => {
    const url = getSiteURL('/login' as never);
    expect(url.search).toBe('');
  });
});

// ---------------------------------------------------------------------------
// getSiteAssetURL
// ---------------------------------------------------------------------------

describe('getSiteAssetURL', () => {
  beforeEach(() => {
    mocks.PUBLIC_SITE_URL = 'https://openshock.app/';
    mocks.asset = (p: string) => p;
  });

  it('builds a URL for a static asset', () => {
    const url = getSiteAssetURL('/logo.svg' as never);
    expect(url.href).toBe('https://openshock.app/logo.svg');
  });

  it('uses the asset() transform', () => {
    mocks.asset = (p: string) => `/_app/immutable${p}`;
    const url = getSiteAssetURL('/logo.svg' as never);
    expect(url.pathname).toBe('/_app/immutable/logo.svg');
  });
});

// ---------------------------------------------------------------------------
// getSiteShortURL
// ---------------------------------------------------------------------------

describe('getSiteShortURL', () => {
  beforeEach(() => {
    mocks.PUBLIC_SITE_SHORT_URL = 'https://shockl.ink/';
  });

  it('builds a short URL from a pathname', () => {
    const url = getSiteShortURL('/usc/ABC123' as never);
    expect(url.href).toBe('https://shockl.ink/usc/ABC123');
  });

  it('trims trailing slashes from the base before appending', () => {
    mocks.PUBLIC_SITE_SHORT_URL = 'https://shockl.ink///';
    const url = getSiteShortURL('/usc/XYZ' as never);
    expect(url.pathname).toBe('/usc/XYZ');
  });

  it('preserves the short URL origin', () => {
    const url = getSiteShortURL('/t/code' as never);
    expect(url.origin).toBe('https://shockl.ink');
  });
});

// ---------------------------------------------------------------------------
// isValidRedirectURL
// ---------------------------------------------------------------------------

describe('isValidRedirectURL', () => {
  beforeEach(() => {
    mocks.PUBLIC_SITE_URL = 'https://openshock.app/';
  });

  it('accepts a same-origin HTTPS URL', () => {
    expect(isValidRedirectURL(new URL('https://openshock.app/home'))).toBe(true);
  });

  it('rejects a cross-origin URL', () => {
    expect(isValidRedirectURL(new URL('https://evil.com/steal'))).toBe(false);
  });

  it('rejects javascript: protocol', () => {
    expect(isValidRedirectURL(new URL('javascript:alert(1)'))).toBe(false);
  });

  it('rejects same host but different port', () => {
    expect(isValidRedirectURL(new URL('https://openshock.app:8080/admin'))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidRedirectParam
// ---------------------------------------------------------------------------

describe('isValidRedirectParam', () => {
  beforeEach(() => {
    mocks.PUBLIC_SITE_URL = 'https://openshock.app/';
  });

  it('accepts a same-origin relative path', () => {
    expect(isValidRedirectParam('/settings/account')).toBe(true);
  });

  it('accepts a same-origin absolute URL', () => {
    expect(isValidRedirectParam('https://openshock.app/home')).toBe(true);
  });

  it('rejects a cross-origin URL', () => {
    expect(isValidRedirectParam('https://evil.com/steal')).toBe(false);
  });

  it('rejects javascript: protocol', () => {
    expect(isValidRedirectParam('javascript:alert(1)')).toBe(false);
  });

  it('rejects data: protocol', () => {
    expect(isValidRedirectParam('data:text/html,<h1>hi</h1>')).toBe(false);
  });

  it('rejects malformed URLs', () => {
    expect(isValidRedirectParam('http://[invalid')).toBe(false);
  });

  it('rejects same host but different port', () => {
    expect(isValidRedirectParam('https://openshock.app:8080/admin')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// sanitizeRedirectSearchParam
// ---------------------------------------------------------------------------

describe('sanitizeRedirectSearchParam', () => {
  beforeEach(() => {
    mocks.PUBLIC_SITE_URL = 'https://openshock.app/';
    mocks.replaceState.mockClear();
  });

  it('strips an invalid redirect param and returns true', () => {
    mocks.page = {
      url: new URL('https://openshock.app/login?redirect=https://evil.com/steal'),
    };

    const result = sanitizeRedirectSearchParam();

    expect(result).toBe(true);
    expect(mocks.replaceState).toHaveBeenCalledOnce();
    const calledUrl = mocks.replaceState.mock.calls[0][0] as URL;
    expect(calledUrl.searchParams.has('redirect')).toBe(false);
  });

  it('preserves a valid redirect param and returns false', () => {
    mocks.page = {
      url: new URL('https://openshock.app/login?redirect=/home'),
    };

    const result = sanitizeRedirectSearchParam();

    expect(result).toBe(false);
    expect(mocks.replaceState).not.toHaveBeenCalled();
  });

  it('returns false when the param is missing', () => {
    mocks.page = {
      url: new URL('https://openshock.app/login'),
    };

    const result = sanitizeRedirectSearchParam();

    expect(result).toBe(false);
    expect(mocks.replaceState).not.toHaveBeenCalled();
  });

  it('uses a custom query param name', () => {
    mocks.page = {
      url: new URL('https://openshock.app/login?return=javascript:alert(1)'),
    };

    const result = sanitizeRedirectSearchParam('return');

    expect(result).toBe(true);
    expect(mocks.replaceState).toHaveBeenCalledOnce();
    const calledUrl = mocks.replaceState.mock.calls[0][0] as URL;
    expect(calledUrl.searchParams.has('return')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// gotoQueryRedirectOrFallback
// ---------------------------------------------------------------------------

describe('gotoQueryRedirectOrFallback', () => {
  beforeEach(() => {
    mocks.base = '';
    mocks.PUBLIC_SITE_URL = 'https://openshock.app/';
    mocks.page = { url: new URL('https://openshock.app/login') };
    mocks.goto.mockClear();
    mocks.match.mockReset().mockResolvedValue(null);
  });

  it('navigates to the fallback when no redirect param exists', async () => {
    await gotoQueryRedirectOrFallback('/home' as never);
    expect(mocks.goto).toHaveBeenCalledWith('/home');
  });

  it('navigates to the redirect param when it matches a route', async () => {
    mocks.page = {
      url: new URL('https://openshock.app/login?redirect=/settings/account'),
    };
    mocks.match.mockResolvedValue('/settings/account');

    await gotoQueryRedirectOrFallback('/home' as never);
    expect(mocks.goto).toHaveBeenCalledWith('/settings/account');
  });

  it('preserves query string from the redirect param', async () => {
    mocks.page = {
      url: new URL('https://openshock.app/login?redirect=/settings%3Ftab%3Dsecurity'),
    };
    mocks.match.mockResolvedValue('/settings');

    await gotoQueryRedirectOrFallback('/home' as never);
    expect(mocks.goto).toHaveBeenCalledWith('/settings?tab=security');
  });

  it('preserves hash fragment from the redirect param', async () => {
    mocks.page = {
      url: new URL('https://openshock.app/login?redirect=/docs%23section-2'),
    };
    mocks.match.mockResolvedValue('/docs');

    await gotoQueryRedirectOrFallback('/home' as never);
    expect(mocks.goto).toHaveBeenCalledWith('/docs#section-2');
  });

  it('preserves both query string and hash fragment', async () => {
    mocks.page = {
      url: new URL('https://openshock.app/login?redirect=/settings%3Ftab%3Dsecurity%23advanced'),
    };
    mocks.match.mockResolvedValue('/settings');

    await gotoQueryRedirectOrFallback('/home' as never);
    expect(mocks.goto).toHaveBeenCalledWith('/settings?tab=security#advanced');
  });

  it('falls back when redirect does not match a known route', async () => {
    mocks.page = {
      url: new URL('https://openshock.app/login?redirect=/unknown'),
    };
    mocks.match.mockResolvedValue(null);

    await gotoQueryRedirectOrFallback('/home' as never);
    expect(mocks.goto).toHaveBeenCalledWith('/home');
  });

  it('rejects cross-origin redirect targets', async () => {
    mocks.page = {
      url: new URL('https://openshock.app/login?redirect=https://evil.com/steal'),
    };
    mocks.match.mockResolvedValue('/steal');

    await gotoQueryRedirectOrFallback('/home' as never);
    expect(mocks.goto).toHaveBeenCalledWith('/home');
    expect(mocks.match).not.toHaveBeenCalled();
  });

  it('rejects redirect targets on same host but different port', async () => {
    mocks.page = {
      url: new URL('https://openshock.app/login?redirect=https://openshock.app:8080/admin'),
    };
    mocks.match.mockResolvedValue('/admin');

    await gotoQueryRedirectOrFallback('/home' as never);
    expect(mocks.goto).toHaveBeenCalledWith('/home');
    expect(mocks.match).not.toHaveBeenCalled();
  });

  it('rejects non-HTTP protocols (javascript:)', async () => {
    mocks.page = {
      url: new URL('https://openshock.app/login?redirect=javascript:alert(1)'),
    };

    await gotoQueryRedirectOrFallback('/home' as never);
    expect(mocks.goto).toHaveBeenCalledWith('/home');
  });

  it('falls back on malformed redirect values', async () => {
    mocks.page = {
      url: new URL('https://openshock.app/login?redirect=:///invalid'),
    };

    await gotoQueryRedirectOrFallback('/home' as never);
    expect(mocks.goto).toHaveBeenCalledWith('/home');
  });

  it('uses a custom query parameter name', async () => {
    mocks.page = {
      url: new URL('https://openshock.app/login?return=/profile'),
    };
    mocks.match.mockResolvedValue('/profile');

    await gotoQueryRedirectOrFallback('/home' as never, 'return');
    expect(mocks.goto).toHaveBeenCalledWith('/profile');
  });

  it('prefixes the base path when navigating', async () => {
    mocks.base = '/app';
    mocks.page = {
      url: new URL('https://openshock.app/app/login?redirect=/settings'),
    };
    mocks.match.mockResolvedValue('/settings');

    await gotoQueryRedirectOrFallback('/home' as never);
    expect(mocks.goto).toHaveBeenCalledWith('/app/settings');
  });
});
