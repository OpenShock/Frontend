import { PRIVATE_BACKEND_TLS_INSECURE } from '$app/env/private';
import { PUBLIC_GITHUB_PROJECT_URL } from '$app/env/public';
import type { Handle, ServerInit } from '@sveltejs/kit/hooks';

/**
 * Security + metadata headers for every dynamically rendered response.
 *
 * The root `_headers` file only applies to static assets on the Cloudflare
 * deploy — SSR'd pages, and everything served by the Node/Docker deploy, get
 * their headers here. Keep the two lists in sync.
 */
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Disable powerful features we never use, so injected/compromised script can't
    // invoke them. `serial` is deliberately NOT restricted — the /terminal firmware
    // flashing flow needs Web Serial, and its default allowlist is already `self`.
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), payment=(), browsing-topics=()',
    // Severs `window.opener` from windows other origins open to us (tab-nabbing);
    // `allow-popups` keeps popups we open ourselves (e.g. Turnstile) working.
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Cross-Origin-Resource-Policy': 'same-origin',
    // Project metadata for the curious.
    'X-Source-Code': PUBLIC_GITHUB_PROJECT_URL,
  };
  for (const [name, value] of Object.entries(headers)) {
    response.headers.set(name, value);
  }

  return response;
};

/**
 * Runs once when the SvelteKit server boots (Node adapter), before any request
 * is handled.
 *
 * When `PRIVATE_BACKEND_TLS_INSECURE=true`, disable TLS certificate validation for
 * server-side requests. SvelteKit's server-side API calls go through Node's
 * global `fetch` (undici), which rejects self-signed / untrusted certificates
 * with `UNABLE_TO_VERIFY_LEAF_SIGNATURE` / `SELF_SIGNED_CERT_IN_CHAIN` — so an
 * OpenShock backend served over HTTPS with a self-signed cert breaks SSR data
 * loads even though the browser (which the user has told to trust the cert)
 * works fine.
 *
 * Node's global fetch honours `NODE_TLS_REJECT_UNAUTHORIZED`, so setting it here
 * (before the first fetch) lets those server-side calls through.
 *
 * This is INSECURE — it disables cert verification for all outgoing TLS from the
 * server process. Only enable it for a trusted self-signed backend in
 * development or on an isolated/self-hosted network. Never enable it in a real
 * production deployment.
 */
export const init: ServerInit = () => {
  // `typeof process` guard: on the Cloudflare adapter there is no Node `process`
  // and no self-signed-cert scenario, so this is a no-op there.
  if (PRIVATE_BACKEND_TLS_INSECURE === 'true' && typeof process !== 'undefined') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.warn(
      '[hooks.server] PRIVATE_BACKEND_TLS_INSECURE=true — TLS certificate validation is DISABLED for ' +
        'server-side requests. This is insecure; use it only with a trusted self-signed backend.'
    );
  }
};
