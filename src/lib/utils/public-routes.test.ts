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
