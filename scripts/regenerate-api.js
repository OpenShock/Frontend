import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const dirs = [
  'src/lib/api/internal/v1',
  'src/lib/api/internal/v2',
  // add more if needed
];

console.log('Cleaning old API subfolders...');
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory does not exist: ${dir}`);
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (!entry.isDirectory()) {
      return;
    }

      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`Deleted folder: ${fullPath}`);
  });
});

console.log('');
console.log('Running OpenAPI Generator...');
try {
  execSync('pnpx @openapitools/openapi-generator-cli generate', { stdio: 'inherit' });
} catch (err) {
  console.error('OpenAPI Generator failed.');
  process.exit(1);
}

// The generator for some reason likes to constantly add and remove .openapi-generator-ignore from the FILES indexes, so lets force it to always be there
console.log('');
console.log('Patching FILES index...');
dirs.forEach((dir) => {
  const filesDir = path.join(dir, '.openapi-generator');
  const indexFile = path.join(filesDir, 'FILES');

  if (!fs.existsSync(indexFile)) {
    console.warn(`FILES index not found: ${indexFile}`);
    return;
  }

  let content = fs.readFileSync(indexFile, 'utf-8')
    .split(/\r?\n/)
    .filter((line) => line.trim() !== ''); // remove empty lines

  const hadIgnore = content.includes('.openapi-generator-ignore');
  content = content.filter(line => line !== '.openapi-generator-ignore');
  content.unshift('.openapi-generator-ignore');

  fs.writeFileSync(indexFile, content.join('\n') + '\n', 'utf-8');

  if (!hadIgnore) {
    console.log(`Added .openapi-generator-ignore back to top of FILES index: ${indexFile}`);
  }
});

console.log('');
console.log('API regeneration complete!');
