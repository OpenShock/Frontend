import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Base API dirs (version folders are autodetected)
const baseDirs = [
  'src/lib/api/internal',
  // add more roots if needed
];

/* -------------------------------------------------
 * Helpers
 * ------------------------------------------------- */
const isVersionDir = (e) => e.isDirectory() && /^v\d+/i.test(e.name);

function findVersionDirs(baseDir) {
  if (!fs.existsSync(baseDir)) return [];
  return fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter(isVersionDir)
    .map((e) => path.join(baseDir, e.name));
}

function rmDirIfExists(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    return true;
  }
  return false;
}

const versionDirs = baseDirs.flatMap(findVersionDirs);

/* -------------------------------------------------
 * Java check
 * ------------------------------------------------- */
console.log('Checking Java installation...');
try {
  execSync('java -version', { stdio: 'inherit' });
} catch {
  console.error('Java is required but was not found in PATH.');
  process.exit(1);
}

/* -------------------------------------------------
 * Cleanup old generated folders
 * ------------------------------------------------- */
if (versionDirs.length > 0) {
  console.log('');
  console.log('Cleaning old API subfolders...');

  for (const dir of versionDirs) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;

      const fullPath = path.join(dir, entry.name);
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`Deleted folder: ${fullPath}`);
    }
  }
}

/* -------------------------------------------------
 * Run OpenAPI Generator
 * ------------------------------------------------- */
console.log('');
console.log('Running OpenAPI Generator...');
try {
  execSync('pnpx @openapitools/openapi-generator-cli generate', { stdio: 'inherit' });
} catch {
  console.error('OpenAPI Generator failed.');
  process.exit(1);
}

/* -------------------------------------------------
 * Patch generator output
 * ------------------------------------------------- */
console.log('');
console.log('Patching OpenAPI generator artifacts...');

for (const dir of baseDirs.flatMap(findVersionDirs)) {
  /* ----- Remove docs directories ----- */
  const docsDir = path.join(dir, 'docs');
  if (rmDirIfExists(docsDir)) {
    console.log(`Deleted docs directory: ${docsDir}`);
  }

  /* ----- Patch FILES index ----- */
  const genDir = path.join(dir, '.openapi-generator');
  const filesIndex = path.join(genDir, 'FILES');

  if (fs.existsSync(filesIndex)) {
    const lines = fs
      .readFileSync(filesIndex, 'utf-8')
      .split(/\r?\n/)
      .filter(Boolean)
      .filter((l) => !l.startsWith('docs/') && l !== '.openapi-generator-ignore');

    lines.unshift('.openapi-generator-ignore');

    fs.writeFileSync(filesIndex, lines.join('\n') + '\n', 'utf-8');
    console.log(`Patched FILES index: ${filesIndex}`);
  }

  /* ----- Patch .openapi-generator-ignore ----- */
  const ignoreFile = path.join(dir, '.openapi-generator-ignore');
  const ignoreBlock = ['', "# Don't generate docs", 'docs/**'].join('\n');

  if (fs.existsSync(ignoreFile)) {
    const content = fs.readFileSync(ignoreFile, 'utf-8');

    if (!content.split(/\r?\n/).some((l) => l.trim() === 'docs/**')) {
      fs.writeFileSync(ignoreFile, content.trimEnd() + ignoreBlock + '\n', 'utf-8');
      console.log(`Added docs ignore rules: ${ignoreFile}`);
    }
  }
}

console.log('');
console.log('API regeneration complete!');
