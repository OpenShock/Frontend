import { m } from '#lib/paraglide/messages.js';
import type { Locale } from '#lib/paraglide/runtime.js';
import { PUBLIC_SITE_DESCRIPTION, PUBLIC_SITE_NAME } from '$app/env/public';
import type { ReadonlyURL } from '$app/state';
import { getSiteAssetURL } from './utils/url';

const LogoSvgAssetURL = getSiteAssetURL('logo.svg');

/**
 * `PUBLIC_SITE_DESCRIPTION` is used verbatim for every locale when set.
 * Otherwise the description is translated.
 */
export function getSiteDescription(options?: { locale?: Locale }): string {
  if (PUBLIC_SITE_DESCRIPTION) return PUBLIC_SITE_DESCRIPTION;
  return PUBLIC_SITE_NAME.toLowerCase() === 'openshock'
    ? m.landing_meta_description({}, options)
    : m.instance_meta_description({ siteName: PUBLIC_SITE_NAME }, options);
}

export function buildMetaData(_url: ReadonlyURL) {
  const image = { src: LogoSvgAssetURL.href, alt: 'OpenShock Logo' };

  return { title: PUBLIC_SITE_NAME, description: getSiteDescription(), image };
}
