import { PUBLIC_BACKEND_API_URL } from '$env/static/public';
import { getBackendURL } from '$lib/utils/url';
import type { CreateClientConfig } from './v1/client.gen';

function resolveBaseUrl(): string {
  if (!PUBLIC_BACKEND_API_URL) {
    throw new Error('PUBLIC_BACKEND_API_URL is not set in the environment');
  }

  try {
    const url = getBackendURL();
    if (url.pathname === '/') return url.origin;
    return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`PUBLIC_BACKEND_API_URL is not a valid URL: ${message}`, { cause: error });
  }
}

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: resolveBaseUrl(),
  credentials: 'include',
  throwOnError: true,
  responseStyle: 'data',
});
