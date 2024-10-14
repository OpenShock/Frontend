import { PUBLIC_SITE_NAME, PUBLIC_SITE_DESCRIPTION } from "$env/static/public";
import type { Page } from "@sveltejs/kit";

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
