import { defineConfig } from '@hey-api/openapi-ts';

const sharedPlugins = [
  {
    name: '@hey-api/client-fetch',
    runtimeConfigPath: './src/lib/api/internal/runtime-config.ts',
    throwOnError: true,
  },
  {
    name: '@hey-api/sdk',
    auth: false,
    operations: { strategy: 'flat' },
    responseStyle: 'data',
    transformer: true,
  },
  {
    name: '@hey-api/typescript',
    enums: { mode: 'javascript', case: 'PascalCase' },
  },
  {
    name: '@hey-api/transformers',
    dates: 'temporal',
  },
] as const;

// The backend serves one document covering every API version. OPENAPI_INPUT overrides it,
// e.g. with a local backend or a saved openapi.json.
export default defineConfig({
  input: process.env.OPENAPI_INPUT ?? 'https://api.openshock.dev/openapi.json',
  output: {
    path: 'src/lib/api/internal/generated',
    postProcess: ['prettier'],
  },
  plugins: sharedPlugins,
});
