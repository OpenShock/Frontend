import { execSync } from 'child_process';
import path from 'path';

const root = path.resolve(import.meta.dirname, '../../..');

export default function globalSetup() {
  execSync('docker compose -f docker-compose.integration.yml up -d --wait', {
    cwd: root,
    stdio: 'inherit',
  });
}
