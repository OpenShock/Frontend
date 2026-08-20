import { PUBLIC_SITE_DESCRIPTION, PUBLIC_SITE_NAME } from '$app/env/public';
import type { ReadonlyURL } from '$app/state';
import { getSiteAssetURL } from './utils/url';

const LogoSvgAssetURL = getSiteAssetURL('logo.svg');

function getPageTitleAndDescription(_url: ReadonlyURL): { title: string; description: string } {
  const title = PUBLIC_SITE_NAME.trim();
  const details = PUBLIC_SITE_DESCRIPTION.trim();

  let description: string;
  switch (title.toLowerCase()) {
    case 'openshock':
      description = `Welcome to OpenShock, ${details}`;
      break;
    default:
      description = `Welcome to ${title}, an independent instance of OpenShock - ${details}`;
      break;
  }

  return { title, description };
}

export function buildMetaData(url: ReadonlyURL) {
  const { title, description } = getPageTitleAndDescription(url);
  const image = { src: LogoSvgAssetURL.href, alt: 'OpenShock Logo' };

  return { title, description, image };
}
