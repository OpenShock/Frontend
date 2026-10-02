import type { OwnerShockerResponse } from '#lib/api/index.js';
import { shockerListSharedShockers } from '#lib/api/index.js';
import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';

let sharedHubs = $state<OwnerShockerResponse[]>([]);

export const sharedHubsState = {
  get value() {
    return sharedHubs;
  },
};

export async function refreshSharedHubs() {
  try {
    const { data } = await shockerListSharedShockers();
    if (!data) throw new Error('Failed to fetch shared devices');
    sharedHubs = data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
