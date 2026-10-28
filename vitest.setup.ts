import '@testing-library/jest-dom/vitest';

// `$app/env/public` compiles to a module that destructures `globalThis.__sveltekit_dev`
// at import time. The dev server defines that global; vitest does not, so anything
// reaching the generated env module (via `#lib/utils/url.js`, for one) throws on import.
// Only the three runtime-overridable flags read `env` — the rest are inlined literals.
globalThis.__sveltekit_dev = { env: {} };
