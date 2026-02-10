/// <reference types="vitest/config" />
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import boxen from 'boxen';
import chalk from 'chalk';
import dns from 'node:dns/promises';
import os from 'node:os';
import { env } from 'node:process';
import license from 'rollup-plugin-license';
import { type PluginOption, defineConfig, loadEnv } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import mkcert from 'vite-plugin-mkcert';

const printError = (msg: string) => console.log(chalk.red.bold(msg));
const printInfo = (msg: string) => console.log(chalk.blue.bold(msg));
const printWhite = (msg: string) => console.log(chalk.white.bold(msg));

const isTruthy = (value?: string) => value === 'true' || value === '1';

async function ensureFqdnRedirect(expectedHost: string, fqdn: string) {
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
      const httpsMessage = [
        'Node.js needs permission to serve HTTPS on port 443.\n',
        'Option 1 (Recommended): Set up a reverse proxy',
        '  Use Nginx or Caddy to proxy traffic to your Node server.',
        '  This is more secure and follows best practices.\n',
        'Option 2 (Quick fix): Grant Node.js permission to bind to privileged ports',
        chalk.blue.bold(`  sudo setcap 'cap_net_bind_service=+ep' $(which node)\n`),
        chalk.yellow.bold('  ⚠️  Security note: This allows Node to bind to ANY port below 1024.'),
        chalk.yellow.bold('  Only use this in trusted development environments.'),
      ].join('\n');

      console.log(
        boxen(httpsMessage, {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'yellow',
          title: 'Additional Linux Setup Required',
          titleAlignment: 'center',
        })
      );
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

function getPlugins(useLocalRedirect: boolean): PluginOption[] {
  const plugins: PluginOption = [];

  if (useLocalRedirect) {
    plugins.push(mkcert());
  }

  plugins.push(tailwindcss());
  plugins.push(sveltekit());
  plugins.push(devtoolsJson());

  plugins.push(
    license({
      thirdParty: {
        includePrivate: true,
        includeSelf: true,
        multipleVersions: true,
        output: {
          file: './.svelte-kit/output/client/LICENSES.txt', // TODO: This seems like a hack, check if theres a better way...
        },
      },
    }) as PluginOption
  ); // TODO: Figure out why typescript thinks this is incompatible ("as PluginOption" is mandatory for svelte check to succeed)

  return plugins;
}

async function getServerConfig(mode: string, useLocalRedirect: boolean) {
  const vars = { ...env, ...loadEnv(mode, process.cwd(), ['PUBLIC_']) };
  if (!vars.PUBLIC_SITE_URL) {
    printError('PUBLIC_SITE_URL must be set in your environment');
    process.exit(1);
  }

  if (!useLocalRedirect) return undefined;

  const domain = new URL(vars.PUBLIC_SITE_URL).hostname;

  if (domain === 'localhost') {
    return { host: 'localhost', port: 8080, proxy: {} };
  }

  let host = domain;

  if (!domain.startsWith('local.')) {
    host = `local.${domain}`;
  }

  // Ensure we have the host entry redirecting to localhost
  await ensureFqdnRedirect('127.0.0.1', host);

  return { host, port: 443, proxy: {} };
}

export default defineConfig(async ({ command, mode, isPreview }) => {
  const isLocalServe = command === 'serve' || isPreview === true;
  const isProduction = mode === 'production' && (isTruthy(env.DOCKER) || isTruthy(env.CF_PAGES));

  // If we are running locally, ensure that local.{PUBLIC_SITE_URL} resolves to localhost, and then use mkcert to generate a certificate
  const useLocalRedirect = isLocalServe && !isProduction && !isTruthy(env.CI);

  return defineConfig({
    build: {
      target: 'es2022',
    },
    plugins: getPlugins(useLocalRedirect),
    server: await getServerConfig(mode, useLocalRedirect),
    test: { include: ['src/**/*.{test,spec}.{js,ts}'] },
    esbuild: {
      legalComments: 'none',
      banner: '/*! For licenses information, see LICENSES.txt */',
      drop: mode === 'production' ? ['debugger'] : [],
      pure: mode === 'production' ? ['console.log', 'console.debug', 'console.trace'] : [],
    },
  });
});
