import { PUBLIC_SITE_DESCRIPTION, PUBLIC_SITE_NAME } from "$env/static/public";
import type { Page } from "@sveltejs/kit";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getPageTitleAndDescription(page: Page): { title: string; description: string } {
  const title = PUBLIC_SITE_NAME.trim();
  const details = PUBLIC_SITE_DESCRIPTION.trim();

  let description: string;
  switch (title.toLowerCase()) {
    case "openshock":
      description = `Welcome to OpenShock, ${details}`;
      break;
    default:
      description = `Welcome to ${title}, an independent instance of OpenShock - ${details}`;
      break;
  }

  return { title, description };
}

export function buildMetaData(page: Page) {
  const { title, description } = getPageTitleAndDescription(page);

  const image = {
    src: new URL('/logo.svg', page.url.origin).href,
    alt: 'OpenShock Logo',
  };

  return {
    title,
    description,
    image
  };
}
