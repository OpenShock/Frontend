import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mapLegacyHashRoute, redirectLegacyHashRoute } from './legacy-hash-redirect';

describe('mapLegacyHashRoute', () => {
  it('returns null when path does not start with /', () => {
    expect(mapLegacyHashRoute('dashboard')).toBeNull();
    expect(mapLegacyHashRoute('')).toBeNull();
    expect(mapLegacyHashRoute('http://example.com')).toBeNull();
  });

  describe('exact routes', () => {
    const cases: [string, string][] = [
      ['/', '/home'],
      ['/dashboard', '/home'],
      ['/dashboard/home', '/home'],
      ['/dashboard/shockers', '/shockers/own'],
      ['/dashboard/shockers/own', '/shockers/own'],
      ['/dashboard/shockers/shared', '/shockers/shared'],
      ['/dashboard/shares', '/shares/public'],
      ['/dashboard/shares/links', '/shares/public'],
      ['/dashboard/admin', '/admin/online-hubs'],
      ['/dashboard/admin/users', '/admin/users'],
      ['/dashboard/admin/online-devices', '/admin/online-hubs'],
      ['/dashboard/profile', '/settings/account'],
      ['/dashboard/profile/account', '/settings/account'],
      ['/dashboard/profile/settings', '/settings/account'],
      ['/dashboard/profile/license', '/settings/account'],
      ['/dashboard/profile/connections', '/settings/connections'],
      ['/dashboard/profile/connections/patreon', '/settings/connections'],
      ['/dashboard/devices', '/hubs'],
      ['/dashboard/tokens', '/settings/api-tokens'],
      ['/account', '/login'],
      ['/account/login', '/login'],
      ['/account/signup', '/signup'],
      ['/account/password', '/forgot-password'],
      ['/account/password/reset', '/forgot-password'],
      ['/public', '/'],
      ['/public/home', '/'],
      ['/public/proxy/token', '/t'],
    ];

    for (const [input, expected] of cases) {
      it(`maps "${input}" → "${expected}"`, () => {
        expect(mapLegacyHashRoute(input)).toBe(expected);
      });
    }
  });

  describe('exact routes preserve query string', () => {
    it('appends query string to exact match result', () => {
      expect(mapLegacyHashRoute('/dashboard?foo=bar')).toBe('/home?foo=bar');
      expect(mapLegacyHashRoute('/account/login?redirect=/home')).toBe('/login?redirect=/home');
    });
  });

  describe('pattern routes', () => {
    const guid = '12345678-1234-1234-1234-123456789abc';

    it('maps /dashboard/shockers/{guid}/shares → /shockers/{guid}/edit', () => {
      expect(mapLegacyHashRoute(`/dashboard/shockers/${guid}/shares`)).toBe(
        `/shockers/${guid}/edit`
      );
    });

    it('maps /dashboard/shockers/{guid}/logs → /shockers/logs/{guid}', () => {
      expect(mapLegacyHashRoute(`/dashboard/shockers/${guid}/logs`)).toBe(`/shockers/logs/${guid}`);
    });

    it('maps /dashboard/shares/links/{guid} → /shares/public/{guid}/edit', () => {
      expect(mapLegacyHashRoute(`/dashboard/shares/links/${guid}`)).toBe(
        `/shares/public/${guid}/edit`
      );
    });

    it('maps /dashboard/devices/{guid}/setup → /hubs', () => {
      expect(mapLegacyHashRoute(`/dashboard/devices/${guid}/setup`)).toBe('/hubs');
    });

    it('maps /dashboard/devices/{guid}/ota → /hubs/{guid}/update', () => {
      expect(mapLegacyHashRoute(`/dashboard/devices/${guid}/ota`)).toBe(`/hubs/${guid}/update`);
    });

    it('maps /account/password/recover/{token}/{token} → /reset-password/{id}/{secret}', () => {
      expect(mapLegacyHashRoute('/account/password/recover/abc123/xyz456')).toBe(
        '/reset-password/abc123/xyz456'
      );
    });

    it('maps /account/activate/{token}/{token} → /activate', () => {
      expect(mapLegacyHashRoute('/account/activate/abc123/xyz456')).toBe('/activate');
    });

    it('maps /public/shares/links/{guid} → /shares/public/{guid}', () => {
      expect(mapLegacyHashRoute(`/public/shares/links/${guid}`)).toBe(`/shares/public/${guid}`);
    });

    it('maps /public/proxy/shares/links/{guid} → /shares/public/{guid}', () => {
      expect(mapLegacyHashRoute(`/public/proxy/shares/links/${guid}`)).toBe(
        `/shares/public/${guid}`
      );
    });

    it('maps /public/proxy/shares/code/{guid} → /usc/{guid}', () => {
      expect(mapLegacyHashRoute(`/public/proxy/shares/code/${guid}`)).toBe(`/usc/${guid}`);
    });
  });

  describe('pattern routes preserve query string', () => {
    const guid = '12345678-1234-1234-1234-123456789abc';

    it('appends query string to pattern match result', () => {
      expect(mapLegacyHashRoute(`/dashboard/shockers/${guid}/logs?page=2`)).toBe(
        `/shockers/logs/${guid}?page=2`
      );
    });
  });

  describe('unknown legacy routes', () => {
    it('returns /home for unknown paths starting with /', () => {
      expect(mapLegacyHashRoute('/unknown/route')).toBe('/home');
      expect(mapLegacyHashRoute('/dashboard/nonexistent')).toBe('/home');
    });

    it('appends query string even for unknown routes', () => {
      expect(mapLegacyHashRoute('/unknown?foo=1')).toBe('/home?foo=1');
    });
  });
});

describe('redirectLegacyHashRoute', () => {
  let replaceMock: ReturnType<typeof vi.fn>;

  function setHash(hash: string) {
    vi.stubGlobal('location', { hash, replace: replaceMock });
  }

  beforeEach(() => {
    replaceMock = vi.fn();
    vi.stubGlobal('location', { hash: '', replace: replaceMock });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does nothing when hash is empty', () => {
    setHash('');
    redirectLegacyHashRoute();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('does nothing when hash does not start with #/', () => {
    setHash('#about');
    redirectLegacyHashRoute();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('redirects a known hash route', () => {
    setHash('#/dashboard');
    redirectLegacyHashRoute();
    expect(replaceMock).toHaveBeenCalledWith('/home');
  });

  it('redirects an unknown hash route to /home', () => {
    setHash('#/some/unknown/path');
    redirectLegacyHashRoute();
    expect(replaceMock).toHaveBeenCalledWith('/home');
  });

  it('does not follow a protocol-relative path — redirects to /home instead', () => {
    setHash('#/dashboard');
    // Pass an unsafe mapper to exercise the defence-in-depth guard directly,
    // since mapLegacyHashRoute itself always returns safe paths.
    redirectLegacyHashRoute('', () => '//evil.com/steal');
    expect(replaceMock).toHaveBeenCalledWith('/home');
  });

  it('does not follow a scheme-prefixed path — redirects to /home instead', () => {
    setHash('#/dashboard');
    redirectLegacyHashRoute('', () => 'javascript:alert(1)');
    expect(replaceMock).toHaveBeenCalledWith('/home');
  });

  it('preserves query string when redirecting', () => {
    setHash('#/dashboard?tab=overview');
    redirectLegacyHashRoute();
    expect(replaceMock).toHaveBeenCalledWith('/home?tab=overview');
  });

  it('prepends pathBase to the redirect target', () => {
    setHash('#/dashboard/shockers');
    redirectLegacyHashRoute('/app');
    expect(replaceMock).toHaveBeenCalledWith('/app/shockers/own');
  });
});
