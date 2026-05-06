import { execSync } from 'child_process';
import path from 'path';

const root = path.resolve(import.meta.dirname, '../../..');

export default function globalTeardown() {
  if (!process.env.CI) return;
  execSync('docker compose -f docker-compose.integration.yml down', {
    cwd: root,
    stdio: 'inherit',
  });
}
