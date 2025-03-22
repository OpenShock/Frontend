import { sveltekit } from '@sveltejs/kit/vite';
import dns from 'dns';
import { env } from 'process';
import { defineConfig, loadEnv, type PluginOption, type UserConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import mkcert from 'vite-plugin-mkcert';

function printRed(message: string) {
  console.log(`\u001b[1;31m${message}\u001b[0m`);
}
function printBlue(message: string) {
  console.log(`\u001b[1;34m${message}\u001b[0m`);
}

function dnsLookup(hostname: string) {
  return new Promise<string>((resolve, reject) => {
    dns.lookup(hostname, (err, address) => {
      if (err) {
        reject(err);
      } else {
        resolve(address);
      }
    });
  });
}

async function ensureFqdnRedirect(host: string, fqdn: string) {
  // Do a DNS lookup to ensure the FQDN resolves to localhost
  try {
    const address = await dnsLookup(fqdn);
    if (address === host) return;
  } catch (err) {
    // Do nothing
  }

  printRed(`Please ensure that ${fqdn} resolves to ${host} in your hosts file\n`);

  console.log('On macOS and Linux, you can do this by running the following command:');
  printBlue(`echo "${host} ${fqdn}" | sudo tee -a /etc/hosts\n`);

  console.log(
    'On Windows, you can do this by running the following command in PowerShell as an administrator:'
  );
  printBlue(
    `Add-Content -Path "C:\\Windows\\System32\\drivers\\etc\\hosts" -Value "${host} ${fqdn}"\n`
  );

  printRed('Then restart your development server');
  process.exit(1);
}

function isThruthy(value: string | undefined) {
  return value === 'true' || value === '1';
}

async function getPlugins(useLocalRedirect: boolean) {
  const plugins: PluginOption[] = [];

  if (useLocalRedirect) {
    // Use the mkcert plugin to generate a certificate
    plugins.push(mkcert());
  }

  // Add the sveltekit plugin
  plugins.push(sveltekit());

  plugins.push(tailwindcss());

  return plugins;
}

async function getServer(mode: string, useLocalRedirect: boolean) {
  if (!useLocalRedirect) return undefined;

  const vars = { ...env, ...loadEnv(mode, process.cwd(), ['PUBLIC_']) };

  // Load environment variables
  if (!vars.PUBLIC_SITE_DOMAIN) {
    printRed('PUBLIC_SITE_DOMAIN must be set in your environment');
    process.exit(1);
  }

  const host = `local.${vars.PUBLIC_SITE_DOMAIN}`;

  // Ensure we have the host entry redirecting to localhost
  await ensureFqdnRedirect('127.0.0.1', host);

  return { host, port: 443, proxy: {} };
}

function getTest() {
  return {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  };
}

export default defineConfig(async ({ command, mode, isPreview }) => {
  const isLocalServe = command === 'serve' || isPreview === true;
  const isProduction = mode === 'production' && (isThruthy(env.DOCKER) || isThruthy(env.CF_PAGES));

  // If we are running locally, ensure that local.{PUBLIC_SITE_DOMAIN} resolves to localhost, and then use mkcert to generate a certificate
  const useLocalRedirect = isLocalServe && !isProduction && !isThruthy(env.CI);

  return defineConfig({
    plugins: await getPlugins(useLocalRedirect),
    server: await getServer(mode, useLocalRedirect),
    test: getTest(),
  } as UserConfig); // TODO: "test" is not a valid property of the defineconfig argument? This needs to get fixed
});
