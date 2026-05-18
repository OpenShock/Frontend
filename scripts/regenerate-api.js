import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const OUTPUT_DIRS = ['src/lib/api/internal/v1', 'src/lib/api/internal/v2'];

console.log('Cleaning previous output...');
for (const dir of OUTPUT_DIRS) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`  Deleted ${dir}`);
  }
}

console.log('');
console.log('Running @hey-api/openapi-ts...');
try {
  execSync('pnpx @hey-api/openapi-ts', { stdio: 'inherit' });
} catch {
  console.error('Codegen failed.');
  process.exit(1);
}

console.log('');
console.log('Sharing v1 client with v2...');
{
  const v2Client = 'src/lib/api/internal/v2/client.gen.ts';
  if (fs.existsSync(v2Client)) {
    fs.writeFileSync(
      v2Client,
      `// Patched by scripts/regenerate-api.js: v2 reuses the v1 client instance.\nexport { client, type CreateClientConfig } from '../v1/client.gen';\n`
    );
    console.log(`  Patched ${v2Client}`);
  }
}

console.log('');
console.log('Rewriting Date → Temporal.Instant...');

const PATCHED_FILES = ['types.gen.ts', 'transformers.gen.ts', 'sdk.gen.ts'];

for (const dir of OUTPUT_DIRS) {
  for (const filename of PATCHED_FILES) {
    const filePath = path.join(dir, filename);
    if (!fs.existsSync(filePath)) continue;

    let source = fs.readFileSync(filePath, 'utf-8');
    const before = source;

    // Types: `: Date` and `Date | null` → Temporal.Instant
    source = source.replaceAll(/\bDate\b(?=\s*[|;,)\]}])/g, 'Temporal.Instant');
    // Transformers/runtime: `new Date(value)` → `Temporal.Instant.from(value)`
    source = source.replaceAll(/new Date\(([^)]+)\)/g, 'Temporal.Instant.from($1)');

    if (source !== before) {
      fs.writeFileSync(filePath, source);
      console.log(`  Patched ${filePath}`);
    }
  }
}

console.log('');
console.log('API regeneration complete.');
