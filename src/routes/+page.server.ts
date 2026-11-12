import { publicGetOnlineDevicesStatistics } from '#lib/api/index.js';

type ResponseType = Promise<{ ok: false; error: string } | { ok: true; deviceCount: number }>;

export const ssr = true;
export const prerender = false;

export async function load({ setHeaders }): ResponseType {
  setHeaders({
    'cache-control': 'public, max-age=300',
    // The page is rendered in the request's language. The Paraglide middleware adds `Vary: Cookie`
    // for the locale cookie, but it knows nothing about the custom Accept-Language strategy, so
    // without this a shared cache could hand one visitor's language to the next.
    vary: 'Accept-Language',
  });

  try {
    const { data } = await publicGetOnlineDevicesStatistics({
      headers: { 'User-Agent': 'OpenShockFrontend/1.0 (ServerSide)' },
      credentials: 'omit',
    });

    return { ok: true, deviceCount: Number(data.devicesOnline) };
  } catch (e) {
    console.error(e);
    return { ok: false, error: 'Failed to fetch device count' };
  }
}
