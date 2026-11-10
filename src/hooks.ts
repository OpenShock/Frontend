import { deLocalizeUrl } from '#lib/paraglide/runtime.js';
import type { Reroute } from '@sveltejs/kit/hooks';

/** Routes locale-prefixed URLs like `/de` to the unprefixed route, see `landingUrlPatterns`. */
export const reroute: Reroute = ({ url }) => deLocalizeUrl(url).pathname;
