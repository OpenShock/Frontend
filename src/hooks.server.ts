import { building } from '$app/environment';
import { env } from '$env/dynamic/public';

type directive =
  | `${'child' | 'connect' | 'default' | 'fenced-frame' | 'font' | 'frame' | 'img' | 'manifest' | 'media' | 'object' | 'prefetch' | 'worker'}-src`
  | `${'script' | 'style'}-src${'' | '-elem' | '-attr'}`;

type directiveValue =
  | "'none'"
  | "'self'"
  | "'unsafe-eval'"
  | "'wasm-unsafe-eval'"
  | "'unsafe-inline'"
  | "'unsafe-hashes'"
  | "'inline-speculation-rules'"
  | "'strict-dynamic'"
  | "'report-sample'"
  | `${'nonce' | 'sha256' | 'sha384' | 'sha512'}-${string}`
  | `${'ws' | 'wss' | 'http' | 'https'}:${'' | `//${string}`}`

function getCspHeaderValue() {
  const domain = env.PUBLIC_SITE_DOMAIN;

  const directives: { [key in directive]?: directiveValue[] } = {
    'default-src': ["'self'", "'unsafe-inline'",],
    'child-src': ['https://challenges.cloudflare.com'],
    'img-src': ["'self'", 'https://www.gravatar.com'],
    'connect-src': [
      "'self'",
      `wss://*.${domain}`,
      `https://*.${domain}`,
      'https://firmware.openshock.org',
      'https://api.pwnedpasswords.com',
      'https://cloudflareinsights.com',
    ],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      'https://challenges.cloudflare.com',
      'https://static.cloudflareinsights.com',
    ],
  };

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

export async function handle({ event, resolve }) {
  const response = await resolve(event);

  if (!building) {
    const csp = getCspHeaderValue();
    response.headers.set('Content-Security-Policy', csp);
  }

  return response;
}
