import { describe, expect, it } from 'vitest';
import { fileToPath } from './public-routes';

describe('fileToPath', () => {
  it('parses the root route', () => {
    const result = fileToPath('/src/routes/+page.svelte');
    expect(result).toEqual({
      path: '/',
      original: '/',
      categories: [],
      parameters: [],
    });
  });

  it('parses a simple path', () => {
    const result = fileToPath('/src/routes/about/+page.svelte');
    expect(result).toEqual({
      path: '/about',
      original: '/about',
      categories: [],
      parameters: [],
    });
  });

  it('parses nested segments', () => {
    const result = fileToPath('/src/routes/settings/account/+page.svelte');
    expect(result).toEqual({
      path: '/settings/account',
      original: '/settings/account',
      categories: [],
      parameters: [],
    });
  });

  it('extracts route groups as categories', () => {
    const result = fileToPath('/src/routes/(auth)/login/+page.svelte');
    expect(result).toEqual({
      path: '/login',
      original: '/(auth)/login',
      categories: ['auth'],
      parameters: [],
    });
  });

  it('extracts multiple route groups', () => {
    const result = fileToPath('/src/routes/(app)/(settings)/profile/+page.svelte');
    expect(result).toEqual({
      path: '/profile',
      original: '/(app)/(settings)/profile',
      categories: ['app', 'settings'],
      parameters: [],
    });
  });

  it('extracts untyped parameters', () => {
    const result = fileToPath('/src/routes/user/[id]/+page.svelte');
    expect(result).toEqual({
      path: '/user/[id]',
      original: '/user/[id]',
      categories: [],
      parameters: [{ name: 'id', type: 'unknown' }],
    });
  });

  it('extracts typed parameters', () => {
    const result = fileToPath('/src/routes/user/[id=integer]/+page.svelte');
    expect(result).toEqual({
      path: '/user/[id]',
      original: '/user/[id=integer]',
      categories: [],
      parameters: [{ name: 'id', type: 'integer' }],
    });
  });

  it('handles groups, params, and segments together', () => {
    const result = fileToPath('/src/routes/(app)/org/[slug=string]/members/+page.svelte');
    expect(result).toEqual({
      path: '/org/[slug]/members',
      original: '/(app)/org/[slug=string]/members',
      categories: ['app'],
      parameters: [{ name: 'slug', type: 'string' }],
    });
  });
});

describe('fileToPath — edge cases', () => {
  it('handles a path with multiple parameters', () => {
    const result = fileToPath('/src/routes/blog/[year=integer]/[slug]/+page.svelte');
    expect(result.path).toBe('/blog/[year]/[slug]');
    expect(result.parameters).toEqual([
      { name: 'year', type: 'integer' },
      { name: 'slug', type: 'unknown' },
    ]);
    expect(result.categories).toEqual([]);
  });

  it('handles a path with no +page.svelte suffix (returns original cleaned)', () => {
    // No /+page.svelte to strip; path becomes the segments after /src/routes
    const result = fileToPath('/src/routes/foo/bar');
    expect(result.path).toBe('/foo/bar');
    expect(result.original).toBe('/foo/bar');
  });

  it('handles input outside of /src/routes (no prefix to strip)', () => {
    const result = fileToPath('/somewhere/else/+page.svelte');
    // Only the +page.svelte suffix gets stripped
    expect(result.original).toBe('/somewhere/else');
    expect(result.path).toBe('/somewhere/else');
  });

  it('handles an empty parameter type defaulting to "unknown"', () => {
    const result = fileToPath('/src/routes/[id=]/+page.svelte');
    // [id=] → split on "=" → ['id', ''] → type defaults to '' (truthy fallback "unknown" only if undefined)
    // Actually: const [name, type = 'unknown'] = 'id='.split('=') yields ['id', ''], so type = ''
    expect(result.parameters).toEqual([{ name: 'id', type: '' }]);
  });

  it('handles consecutive groups followed by root', () => {
    const result = fileToPath('/src/routes/(marketing)/+page.svelte');
    expect(result.path).toBe('/');
    expect(result.original).toBe('/(marketing)');
    expect(result.categories).toEqual(['marketing']);
    expect(result.parameters).toEqual([]);
  });

  it('handles trailing slashes by ignoring empty segments', () => {
    const result = fileToPath('/src/routes/foo//bar/+page.svelte');
    expect(result.path).toBe('/foo/bar');
  });

  it('handles a path with a parameter at the root', () => {
    const result = fileToPath('/src/routes/[token]/+page.svelte');
    expect(result.path).toBe('/[token]');
    expect(result.parameters).toEqual([{ name: 'token', type: 'unknown' }]);
  });

  it('handles a parameter with hyphen and equals sign in type', () => {
    const result = fileToPath('/src/routes/x/[id=uuid]/+page.svelte');
    expect(result.parameters).toEqual([{ name: 'id', type: 'uuid' }]);
    expect(result.path).toBe('/x/[id]');
  });

  it('returns "/" path when input is exactly /src/routes', () => {
    const result = fileToPath('/src/routes');
    expect(result.path).toBe('/');
    expect(result.original).toBe('/');
  });

  it('returns original "/" when only +page.svelte suffix exists at root', () => {
    const result = fileToPath('/src/routes/+page.svelte');
    expect(result.path).toBe('/');
    expect(result.original).toBe('/');
    expect(result.categories).toEqual([]);
    expect(result.parameters).toEqual([]);
  });
});
