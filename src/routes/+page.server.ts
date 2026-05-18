import { publicGetOnlineDevicesStatistics } from '$lib/api';

type ResponseType = Promise<{ ok: false; error: string } | { ok: true; deviceCount: number }>;

export const ssr = true;
export const prerender = false;

export async function load({ setHeaders }): ResponseType {
  setHeaders({
    'cache-control': 'public, max-age=300',
  });

  try {
    const envelope = await publicGetOnlineDevicesStatistics({
      headers: { 'User-Agent': 'OpenShockFrontend/1.0 (ServerSide)' },
      credentials: 'omit',
    });

    if (!envelope.data) {
      return { ok: false, error: envelope.message ?? 'Failed to fetch device count' };
    }

    return { ok: true, deviceCount: Number(envelope.data.devicesOnline) };
  } catch (e) {
    console.error(e);
    return { ok: false, error: 'Failed to fetch device count' };
  }
}
