// Compares the problem-type registry in src/lib/errorhandling/problemTypes.ts against the
// problem types defined in the API source.
// The API checkout is located via OPENSHOCK_API_DIR, falling back to the sibling ../API folder.
// Without a checkout the script prints a notice and exits 0, so CI is unaffected.
// Exits 1 on drift only when --strict is passed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const apiDir = process.env.OPENSHOCK_API_DIR ?? path.resolve(here, '..', '..', 'API');
const strict = process.argv.includes('--strict');

const ERROR_DIRS = ['Common/Errors', 'API/Errors', 'Common/Problems', 'API/OAuth'];

/** @param {string} dir */
export function listCsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && e.name.endsWith('.cs'))
    .map((e) => path.join(e.parentPath, e.name));
}

// Matches the first string literal of `new X("...")`, `new("...")` and `: base("...")`.
// No dot is required in the literal: one backend type is the bare string "ExpressionError".
const TYPE_LITERAL = /(?:\bnew\s*[A-Za-z_]*\s*|\bbase\s*)\(\s*"([^"]+)"/g;

/** @param {string} root */
export function extractBackendProblemTypes(root) {
  /** @type {Set<string>} */
  const types = new Set();
  for (const dir of ERROR_DIRS) {
    for (const file of listCsFiles(path.join(root, dir))) {
      const source = fs.readFileSync(file, 'utf8');
      for (const match of source.matchAll(TYPE_LITERAL)) types.add(match[1]);
    }
  }
  return types;
}

async function main() {
  if (!fs.existsSync(apiDir)) {
    console.log(`check-problem-types: no API checkout at ${apiDir}, skipping.`);
    return;
  }

  const { ProblemTypes } = await import('../src/lib/errorhandling/problemTypes.ts');
  const registry = new Set(Object.keys(ProblemTypes));
  const backend = extractBackendProblemTypes(apiDir);
  // Built inline in controllers rather than in an error class.
  backend.add('InternalServerError');

  const missing = [...backend].filter((t) => !registry.has(t)).sort();
  const extra = [...registry].filter((t) => !backend.has(t)).sort();

  if (missing.length === 0 && extra.length === 0) {
    console.log(`check-problem-types: registry matches the API (${backend.size} types).`);
    return;
  }

  if (missing.length) {
    console.log('check-problem-types: defined in the API but missing from the registry:');
    for (const t of missing) console.log(`  + ${t}`);
  }
  if (extra.length) {
    console.log('check-problem-types: in the registry but not defined in the API:');
    for (const t of extra) console.log(`  - ${t}`);
  }
  if (strict) process.exit(1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
