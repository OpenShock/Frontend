const GUID = '([0-9a-fA-F-]{36})';
const TOKEN = '([^/]+)';

const EXACT: Record<string, string> = {
  '/': '/home',
  '/dashboard': '/home',
  '/dashboard/home': '/home',
  '/dashboard/shockers': '/shockers/own',
  '/dashboard/shockers/own': '/shockers/own',
  '/dashboard/shockers/shared': '/shockers/shared',
  '/dashboard/shares': '/shares/public',
  '/dashboard/shares/links': '/shares/public',
  '/dashboard/admin': '/admin/online-hubs',
  '/dashboard/admin/users': '/admin/users',
  '/dashboard/admin/online-devices': '/admin/online-hubs',
  '/dashboard/profile': '/settings/account',
  '/dashboard/profile/account': '/settings/account',
  '/dashboard/profile/settings': '/settings/account',
  '/dashboard/profile/license': '/settings/account',
  '/dashboard/profile/connections': '/settings/connections',
  '/dashboard/profile/connections/patreon': '/settings/connections',
  '/dashboard/devices': '/hubs',
  '/dashboard/tokens': '/settings/api-tokens',
  '/account': '/login',
  '/account/login': '/login',
  '/account/signup': '/signup',
  '/account/password': '/forgot-password',
  '/account/password/reset': '/forgot-password',
  '/public': '/',
  '/public/home': '/',
  '/public/proxy/token': '/t',
};

const PATTERNS: { re: RegExp; to: string }[] = [
  { re: new RegExp(`^/dashboard/shockers/${GUID}/shares$`), to: '/shockers/$1/edit' },
  { re: new RegExp(`^/dashboard/shockers/${GUID}/logs$`), to: '/shockers/logs/$1' },
  { re: new RegExp(`^/dashboard/shares/links/${GUID}$`), to: '/shares/public/$1/edit' },
  { re: new RegExp(`^/dashboard/devices/${GUID}/setup$`), to: '/hubs' },
  { re: new RegExp(`^/dashboard/devices/${GUID}/ota$`), to: '/hubs/$1/update' },
  { re: new RegExp(`^/account/password/recover/${TOKEN}/${TOKEN}$`), to: '/forgot-password' },
  { re: new RegExp(`^/account/activate/${TOKEN}/${TOKEN}$`), to: '/activate' },
  { re: new RegExp(`^/public/shares/links/${GUID}$`), to: '/shares/public/$1' },
  { re: new RegExp(`^/public/proxy/shares/links/${GUID}$`), to: '/shares/public/$1' },
  { re: new RegExp(`^/public/proxy/shares/code/${GUID}$`), to: '/usc/$1' },
];

/**
 * Maps a legacy WebUI hash route (without the leading `#`) to its new path,
 * or returns `null` if the path doesn't look like a legacy route.
 */
export function mapLegacyHashRoute(legacyPath: string): string | null {
  if (!legacyPath.startsWith('/')) return null;

  const qIdx = legacyPath.indexOf('?');
  const path = qIdx === -1 ? legacyPath : legacyPath.slice(0, qIdx);
  const search = qIdx === -1 ? '' : legacyPath.slice(qIdx);

  if (Object.prototype.hasOwnProperty.call(EXACT, path)) return EXACT[path] + search;

  for (const { re, to } of PATTERNS) {
    if (re.test(path)) return path.replace(re, to) + search;
  }

  // Unknown legacy route → home so the user isn't dumped on a 404.
  return '/home' + search;
}

/**
 * If the current URL has a legacy `#/...` hash route, replace it with the
 * mapped new path. Call before the SvelteKit router boots.
 */
export function redirectLegacyHashRoute(): void {
  const hash = location.hash;
  if (!hash || hash.charAt(1) !== '/') return;

  const target = mapLegacyHashRoute(hash.slice(1));
  if (!target) return;

  // Defense-in-depth: only allow same-origin, root-relative redirects.
  // Reject protocol-relative (`//...`) and scheme-prefixed (`http:...`, `javascript:...`) values.
  const isSafeInternalPath = target.startsWith('/') && !target.startsWith('//') && !/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(target);
  location.replace(isSafeInternalPath ? target : '/home');
}
