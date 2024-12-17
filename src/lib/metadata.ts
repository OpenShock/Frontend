import { PUBLIC_SITE_DESCRIPTION, PUBLIC_SITE_NAME } from '$env/static/public';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getPageTitleAndDescription(url: URL): { title: string; description: string } {
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

export function buildMetaData(url: URL) {
  const { title, description } = getPageTitleAndDescription(url);

  const image = {
    src: new URL('/logo.svg', url.origin).href,
    alt: 'OpenShock Logo',
  };

  return {
    title,
    description,
    image,
  };
}
