import { shockersV1Api } from '$lib/api';
import { handleApiError } from '$lib/errorhandling/apiErrorHandling.js';

export async function load({ parent }) {
  await parent();
  try {
    const res = await shockersV1Api.shockerGetAllShockerLogs();
    return { logs: res.logs ?? [] };
  } catch (err) {
    handleApiError(err);
    return { logs: [] };
  }
}
