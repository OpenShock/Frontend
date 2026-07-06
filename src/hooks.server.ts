import { env } from '$env/dynamic/private';
import type { ServerInit } from '@sveltejs/kit';

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
  if (env.PRIVATE_BACKEND_TLS_INSECURE === 'true' && typeof process !== 'undefined') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.warn(
      '[hooks.server] PRIVATE_BACKEND_TLS_INSECURE=true — TLS certificate validation is DISABLED for ' +
        'server-side requests. This is insecure; use it only with a trusted self-signed backend.'
    );
  }
};
