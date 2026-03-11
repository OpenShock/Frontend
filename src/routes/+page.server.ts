import { PUBLIC_BACKEND_API_URL } from '$env/static/public';
import { Configuration, MetaApi } from '$lib/api/internal/v1';

type ResponseType = Promise<{ ok: false; error: string } | { ok: true; deviceCount: number }>;

export const ssr = true;
export const prerender = false;

export async function load({ setHeaders }): ResponseType {
  setHeaders({
    'cache-control': 'public, max-age=300',
  });

  let deviceCount: number;

  try {
    const metaApi = new MetaApi(
      new Configuration({
        basePath: PUBLIC_BACKEND_API_URL,
        headers: {
          'User-Agent': 'OpenShockFrontend/1.0 (ServerSide)',
        },
        credentials: 'omit',
      })
    );

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
