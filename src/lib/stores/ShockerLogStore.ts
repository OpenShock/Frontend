import { shockersV1Api } from '$lib/api';
import { type LogEntry } from '$lib/api/internal/v1';
import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
import { writable } from 'svelte/store';

export const ShockerLogStore = writable<Map<string, LogEntry[]>>(new Map());

export function fetchLogsForShocker(shockerId: string) {
  shockersV1Api
    .shockerGetShockerLogs(shockerId)
    .then((response) => {
      if (!response.data) {
        throw new Error(`Failed to fetch logs: ${response.message}`);
      }

      const grouped = response.data.reduce((acc, entry) => {
        if (!acc.has(entry.id)) {
          acc.set(entry.id, []);
        }
        acc.get(entry.id)!.push({
          id: entry.id,
          createdOn: new Date(entry.createdOn),
          type: entry.type,
          controlledBy: entry.controlledBy,
          intensity: entry.intensity,
          duration: entry.duration,
        });
        return acc;
      }, new Map<string, LogEntry[]>());
      ShockerLogStore.set(grouped);
    })
    .catch(handleApiError);
}
