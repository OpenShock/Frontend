/**
 * Stand-in for the `temporal-polyfill` module (wired up via a Vite alias on the
 * bare specifier — see vite.config.ts).
 *
 * The generated API client imports `Temporal` from 'temporal-polyfill', but most
 * engines we run on ship Temporal natively (ES2026): Node 26, Chrome/Edge 144+,
 * Firefox 139+. Only Safari still lacks it. Loading the polyfill through this
 * shim means the ~20 kB implementation is only fetched when the runtime has no
 * native `Temporal` — everyone else uses the built-in one.
 *
 * TypeScript still resolves 'temporal-polyfill' to the real package for types;
 * the alias only affects the bundled runtime.
 */
if (!('Temporal' in globalThis)) {
  await import('temporal-polyfill/global');
}

export const Temporal = globalThis.Temporal;
