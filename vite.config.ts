import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type PluginOption, loadEnv } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import dns from 'dns';
import { env } from 'process';

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

  console.log('On Windows, you can do this by running the following command in PowerShell as an administrator:');
  printBlue(`Add-Content -Path "C:\\Windows\\System32\\drivers\\etc\\hosts" -Value "${host} ${fqdn}"\n`);

  printRed('Then restart your development server');
  process.exit(1);
}

function isThruthy(value: string | undefined) {
  return value === 'true' || value === '1';
}

export default defineConfig(async ({ command, mode, isPreview }) => {
  let host: string | undefined;
  let port: number | undefined;
  const plugins: PluginOption[] = [];

  const isLocalServe = command === 'serve' || isPreview === true;
  const isProduction = mode === 'production' && (isThruthy(env.CI) || isThruthy(env.DOCKER) || isThruthy(env.CF_PAGES));

  const vars = { ...env, ...loadEnv(mode, process.cwd(), ['PUBLIC_']) };

  // If non-prod, ensure that local.{PUBLIC_SITE_DOMAIN} resolves to localhost, and then use mkcert to generate a certificate
  if (isLocalServe && !isProduction) {
    // Load environment variables
    if (!vars.PUBLIC_SITE_DOMAIN) {
      printRed('PUBLIC_SITE_DOMAIN must be set in your environment');
      process.exit(1);
    }

    host = `local.${vars.PUBLIC_SITE_DOMAIN}`;
    port = 443;

    // Ensure we have the host entry redirecting to localhost
    await ensureFqdnRedirect('127.0.0.1', host);

    plugins.push(mkcert());
  }

  // Add the sveltekit plugin
  plugins.push(sveltekit());

  // Configure the purgeCss plugin
  plugins.push(purgeCss());

  return defineConfig({ plugins, server: { host, port, proxy: {} } });
});
