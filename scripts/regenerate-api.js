import { execSync } from 'node:child_process';
import fs from 'node:fs';

const OUTPUT_DIR = 'src/lib/api/internal/generated';
// Per-version clients from before the backend served a single document; removed if still present.
const LEGACY_DIRS = ['src/lib/api/internal/v1', 'src/lib/api/internal/v2'];

console.log('Cleaning previous output...');
for (const dir of [OUTPUT_DIR, ...LEGACY_DIRS]) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`  Deleted ${dir}`);
  }
}

console.log('');
console.log('Running @hey-api/openapi-ts...');
try {
  execSync('pnpm exec openapi-ts', { stdio: 'inherit', shell: true });
} catch {
  console.error('Codegen failed.');
  process.exit(1);
}

console.log('');
console.log('Formatting generated output...');
try {
  execSync(`pnpm exec prettier --write ${OUTPUT_DIR}`, {
    stdio: 'inherit',
    shell: true,
  });
} catch {
  console.error('Formatting failed.');
  process.exit(1);
}

console.log('');
console.log('Checking problem type registry against the API source...');
try {
  execSync('node scripts/check-problem-types.js', { stdio: 'inherit', shell: true });
} catch {
  console.warn('Problem type check failed; see output above.');
}

console.log('');
console.log('API regeneration complete.');
