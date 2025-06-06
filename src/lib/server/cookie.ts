import type { Cookies } from "@sveltejs/kit";

export const ApiCookieName = 'openShockSession';

export function HasOpenShockCookie(cookies: Cookies): boolean {
  const cookieValue = cookies.get(ApiCookieName);
  if (cookieValue === undefined || cookieValue === null) {
    return false;
  }

  return true;
}
