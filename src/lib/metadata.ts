import { PUBLIC_SITE_DESCRIPTION, PUBLIC_SITE_NAME } from '$app/env/public';
import type { ReadonlyURL } from '$app/state';
import { getSiteAssetURL } from './utils/url';

const LogoSvgAssetURL = getSiteAssetURL('logo.svg');

function getPageTitleAndDescription(_url: ReadonlyURL): { title: string; description: string } {
  let description: string;
  switch (PUBLIC_SITE_NAME.toLowerCase()) {
    case 'openshock':
      description = `Welcome to OpenShock, ${PUBLIC_SITE_DESCRIPTION}`;
      break;
    default:
      description = `Welcome to ${PUBLIC_SITE_NAME}, an independent instance of OpenShock - ${PUBLIC_SITE_DESCRIPTION}`;
      break;
  }

  return { title: PUBLIC_SITE_NAME, description };
}

export function buildMetaData(url: ReadonlyURL) {
  const { title, description } = getPageTitleAndDescription(url);
  const image = { src: LogoSvgAssetURL.href, alt: 'OpenShock Logo' };

  return { title, description, image };
}
