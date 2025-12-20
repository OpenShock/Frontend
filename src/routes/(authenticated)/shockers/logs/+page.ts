import { shockersV1Api } from '$lib/api';
import type { LogEntry } from '$lib/api/internal/v1';
import { handleApiError } from '$lib/errorhandling/apiErrorHandling.js';

export type ShockerLogEntry = LogEntry & {
  hubName: string;
  shockerName: string;
};

export async function load(): Promise<{ logs: ShockerLogEntry[] }> {
  try {
    // TODO create a V2 endpoint that gets logs for all shockers in one call
    const { data: hubs } = await shockersV1Api.shockerListShockers();
    if (!hubs) {
      return { logs: [] };
    }
    const logPromises =
      hubs.flatMap((hub) =>
        hub.shockers?.map((shocker) =>
          shockersV1Api
            .shockerGetShockerLogs(shocker.id!)
            .then((res) => ({ hubName: hub.name, shockerName: shocker.name, data: res.data ?? [] }))
        )
      ) ?? [];
    const logResponses = await Promise.all(logPromises);
    const allLogs = logResponses.flatMap((res) =>
      res.data.map((log) => ({ ...log, hubName: res.hubName, shockerName: res.shockerName }))
    );
    return { logs: allLogs ?? [] };
  } catch (err) {
    handleApiError(err);
    return { logs: [] };
  }
}
