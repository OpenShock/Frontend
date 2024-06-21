import { env } from "$env/dynamic/public";
import type { Page } from "@sveltejs/kit";

function getPageTitle(page: Page) {
  return env.PUBLIC_SITE_NAME?.trim() || "OpenShock";
}

function getPageTitleAndDescription(page: Page): { title: string; description: string } {
  const title = getPageTitle(page);
  const details = env.PUBLIC_SITE_DESCRIPTION || "a free and open-source ecosystem to control various shock collars over the internet.";

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
