import type { Handle } from '@sveltejs/kit';

if (typeof (globalThis as { Temporal?: unknown }).Temporal === 'undefined') {
  await import('temporal-polyfill/global');
}

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  return response;
};
