import { metaApi } from '$lib/api';

export const ssr = true;
export const prerender = false;

export async function load({ setHeaders }): Promise<{ ok: false, error: string } | { ok: true, deviceCount: number }> {
  setHeaders({
    'cache-control': 'public, max-age=300'
  })

  let deviceCount: number;

  try {
    const { data } = await metaApi.publicGetOnlineDevicesStatistics();

    deviceCount = data.devicesOnline;
  } catch (e) {
    console.error(e);

    return {
      ok: false,
      error: 'Failed to fetch device count',
    };
  }

  return { ok: true, deviceCount };
}
