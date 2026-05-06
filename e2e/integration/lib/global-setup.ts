import { execSync } from 'child_process';
import path from 'path';

const root = path.resolve(import.meta.dirname, '../../..');

export default function globalSetup() {
  try {
    execSync('docker compose -f docker-compose.integration.yml up -d --wait', {
      cwd: root,
      stdio: 'inherit',
    });
  } catch (err) {
    console.error(
      '\n[integration] failed to start docker-compose stack - is Docker Desktop running?\n'
    );
    throw err;
  }
}
