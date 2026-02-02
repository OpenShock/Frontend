import { shockersV1Api } from '$lib/api';
import { handleApiError } from '$lib/errorhandling/apiErrorHandling.js';

export async function load({ params }) {
  try {
    const shockerId = params.shockerId;
    const logsPromise = shockersV1Api.shockerGetShockerLogs(shockerId);
    const shockerPromise = shockersV1Api.shockerGetShockerById(shockerId);
    const [logsRes, shockerRes] = await Promise.all([logsPromise, shockerPromise]);
    return { logs: logsRes.data ?? [], shocker: shockerRes.data };
  } catch (err) {
    handleApiError(err);
    return { logs: [] };
  }
}
