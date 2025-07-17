import { metaApi } from '$lib/api';

export async function load({ setHeaders }): Promise<{ ok: false, error: string } | { ok: true, deviceCount: number }> {
  setHeaders({
    'cache-control': 'public, max-age=300'
  })

  const { data } = await metaApi.publicGetOnlineDevicesStatistics();

  return { ok: true, deviceCount: data.devicesOnline };
}
