import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type PluginOption, loadEnv } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import dns from 'dns';

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

export default defineConfig(async ({ mode }) => {
  let host: string | undefined;
  let port: number | undefined;
  const plugins: PluginOption[] = [];

  // Ensure that local.{PUBLIC_SITE_DOMAIN} resolves to localhost, and then use mkcert to generate a certificate
  if (process.env.NODE_ENV === 'development' && !process.env.CI) {
    // Load environment variables
    process.env = { ...process.env, ...loadEnv(mode, process.cwd(), ['PUBLIC_']) };

    host = `local.${process.env.PUBLIC_SITE_DOMAIN}`;
    port = 443;

    // Ensure we have the host entry redirecting to localhost
    await ensureFqdnRedirect('127.0.0.1', host);

    plugins.push(mkcert());
  }

  // Add the sveltekit plugin
  plugins.push(sveltekit());

  // Configure the purgeCss plugin
  plugins.push(purgeCss({
    safelist: {
      // any selectors that begin with "hljs-" will not be purged
      greedy: [/^hljs-/],
    },
  }));

  return defineConfig({ plugins, server: { host, port } });
});
