import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import dns from 'dns/promises';
import { env } from 'process';
import license from 'rollup-plugin-license';
import { type PluginOption, defineConfig, loadEnv } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import mkcert from 'vite-plugin-mkcert';

function printColor(message: string, colorCode: string) {
  console.log(`\u001b[1;${colorCode}m${message}\u001b[0m`);
}
const printError = (msg: string) => printColor(msg, '31');
const printInfo = (msg: string) => printColor(msg, '34');

const isTruthy = (value?: string) => value === 'true' || value === '1';

async function ensureFqdnRedirect(expectedHost: string, fqdn: string) {
  // Do a DNS lookup to ensure the FQDN resolves to localhost
  try {
    const { address } = await dns.lookup(fqdn);
    if (address === expectedHost) return;
  } catch {
    // Ignore errors
  }

  printError(`Please ensure that ${fqdn} resolves to ${expectedHost} in your hosts file\n`);

  console.log('macOS / Linux:');
  printInfo(`   echo "${expectedHost} ${fqdn}" | sudo tee -a /etc/hosts\n`);

  console.log('Windows (PowerShell as Administrator):');
  printInfo(
    `   Add-Content -Path "C:\\Windows\\System32\\drivers\\etc\\hosts" -Value "${expectedHost} ${fqdn}"\n`
  );

  printError('Then restart your development server');
  process.exit(1);
}

function getPlugins(useLocalRedirect: boolean): PluginOption[] {
  const plugins: PluginOption = [];

  if (useLocalRedirect) {
    plugins.push(mkcert());
  }

  plugins.push(sveltekit());
  plugins.push(tailwindcss());
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
  if (!useLocalRedirect) return undefined;

  const vars = { ...env, ...loadEnv(mode, process.cwd(), ['PUBLIC_']) };
  const domain = vars.PUBLIC_SITE_DOMAIN;

  // Load environment variables
  if (!domain) {
    printError('PUBLIC_SITE_DOMAIN must be set in your environment');
    process.exit(1);
  }

  if(domain === 'localhost') {
    return { host: 'localhost', port: 8080, proxy: {} };
  }

  const host = `local.${domain}`;

  // Ensure we have the host entry redirecting to localhost
  await ensureFqdnRedirect('127.0.0.1', host);

  return { host, port: 443, proxy: {} };
}

export default defineConfig(async ({ command, mode, isPreview }) => {
  const isLocalServe = command === 'serve' || isPreview === true;
  const isProduction = mode === 'production' && (isTruthy(env.DOCKER) || isTruthy(env.CF_PAGES));

  // If we are running locally, ensure that local.{PUBLIC_SITE_DOMAIN} resolves to localhost, and then use mkcert to generate a certificate
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
