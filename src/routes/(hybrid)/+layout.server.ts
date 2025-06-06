import { HasOpenShockCookie } from '$lib/server/cookie';

// Report to the browser if we are authenticated or not
export function load({ cookies }) {
  return {
    isAuthenticated: HasOpenShockCookie(cookies)
  }
}
