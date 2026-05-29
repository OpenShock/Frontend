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
    dates: true,
  },
] as const;

export default defineConfig([
  {
    input: 'http://localhost/swagger/1/swagger.json',
    output: {
      path: 'src/lib/api/internal/v1',
      postProcess: ['prettier'],
    },
    plugins: sharedPlugins,
  },
  {
    input: 'http://localhost/swagger/2/swagger.json',
    output: {
      path: 'src/lib/api/internal/v2',
      postProcess: ['prettier'],
    },
    plugins: sharedPlugins,
  },
]);
