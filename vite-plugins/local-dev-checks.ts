import boxen from 'boxen';
import chalk from 'chalk';
import dns from 'node:dns/promises';
import net from 'node:net';
import os from 'node:os';
import { type Plugin } from 'vite';

const printError = (msg: string) => console.log(chalk.red.bold(msg));
const printInfo = (msg: string) => console.log(chalk.blue.bold(msg));
const printWhite = (msg: string) => console.log(chalk.white.bold(msg));

function printBoxed(title: string, message: string) {
  console.log(
    boxen(message, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'yellow',
      title,
      titleAlignment: 'center',
    })
  );
}

function linuxPrivilegedPortHelp(port: number): string {
  return [
    `Node.js needs permission to serve HTTPS on port ${port}.\n`,
    'Option 1 (Recommended): Set up a reverse proxy',
    '  Use Nginx or Caddy to proxy traffic to your Node server.',
    '  This is more secure and follows best practices.\n',
    'Option 2 (Quick fix): Grant Node.js permission to bind to privileged ports',
    chalk.blue.bold(`  sudo setcap 'cap_net_bind_service=+ep' $(which node)\n`),
    chalk.yellow.bold('  ⚠️  Security note: This allows Node to bind to ANY port below 1024.'),
    chalk.yellow.bold('  Only use this in trusted development environments.'),
  ].join('\n');
}

async function ensureFqdnRedirect(expectedHost: string, fqdn: string, port: number) {
  let resolvedAddress: string | null = null;

  try {
    const result = await dns.lookup(fqdn);
    resolvedAddress = result.address;
    if (resolvedAddress === expectedHost) {
      return;
    }
  } catch {
    // DNS lookup failed — treat as misconfigured
  }

  // Display the problem
  printError('Local development host misconfiguration detected\n');
  printWhite(`Domain: ${chalk.green.bold(fqdn)}`);
  printWhite(`Expected IP: ${chalk.green.bold(expectedHost)}`);
  printWhite(`Actual IP: ${chalk.bgRed.bold(resolvedAddress ?? '<no DNS entry>')}\n`);
  printWhite('This prevents the local frontend from using cookies from the API.\n');

  // Platform-specific fixes
  const platform = os.platform();

  if (platform === 'linux' || platform === 'darwin') {
    printWhite('To add the entry to your hosts file, run this command:\n');
    printInfo(`  echo "${expectedHost} ${fqdn}" | sudo tee -a /etc/hosts\n`);

    if (platform === 'linux') {
      printBoxed('Additional Linux Setup Required', linuxPrivilegedPortHelp(port));
      console.log('');
    }
  } else if (platform === 'win32') {
    printWhite(
      'To add the entry to your hosts file, run this command in PowerShell as Administrator:\n'
    );
    printInfo(
      `  Add-Content -Path "C:\\Windows\\System32\\drivers\\etc\\hosts" -Value "${expectedHost} ${fqdn}"\n`
    );
  } else {
    printWhite(`To fix: Update your hosts file to resolve "${fqdn}" to ${expectedHost}\n`);
  }

  printWhite('After updating the hosts file, restart the development server.\n');
  process.exit(1);
}

async function ensurePortBindable(host: string, port: number): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  const server = net.createServer();
  server.once('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EACCES') {
      const platform = os.platform();
      let fix: string;

      if (platform === 'linux') {
        fix = linuxPrivilegedPortHelp(port);
      } else if (platform === 'darwin') {
        fix = [
          `Node.js needs permission to serve HTTPS on port ${port}.\n`,
          'Fix: Run the dev server with sudo, or set up a reverse proxy.',
        ].join('\n');
      } else {
        fix = `Node.js does not have permission to bind to port ${port}.\nTry running with elevated privileges or use a reverse proxy.`;
      }

      printBoxed(`Port ${port} Permission Denied`, fix);
      process.exit(1);
    }
    // For other errors (e.g. EADDRINUSE), let Vite handle them
    resolve();
  });
  server.once('listening', () => {
    server.close(() => resolve());
  });
  server.listen(port, host);
  return promise;
}

/**
 * The hosts-redirect and privileged-port bind checks have real side effects
 * (DNS lookups, probe sockets, process.exit on misconfig). They run ONLY when
 * an actual dev or preview server is starting — never during `svelte-kit sync`,
 * `svelte-check`, codegen, unit tests, or production builds, all of which also
 * evaluate the Vite config.
 */
export function localDevChecksPlugin(fqdn: string, port: number): Plugin {
  let ran = false;
  const runChecks = async () => {
    if (ran) return;
    ran = true;
    // Ensure local.<domain> resolves to localhost so the frontend shares API cookies
    await ensureFqdnRedirect('127.0.0.1', fqdn, port);
    // Verify we can bind the port before Vite tries and fails with an unhelpful error
    await ensurePortBindable(fqdn, port);
  };
  return {
    name: 'local-dev-checks',
    configureServer: runChecks, // `vite dev`
    configurePreviewServer: runChecks, // `vite preview`
  };
}
