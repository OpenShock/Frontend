import { HasOpenShockCookie } from '$lib/server/cookie';

// Let the client know if its authenticated or not
export function load({ cookies }) {
  return {
    isAuthenticated: HasOpenShockCookie(cookies)
  }
}
