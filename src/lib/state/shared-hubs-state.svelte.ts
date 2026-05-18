import type { OwnerShockerResponse } from '$lib/api';
import { shockerListSharedShockers } from '$lib/api';
import { handleApiError } from '$lib/errorhandling/apiErrorHandling';

let sharedHubs = $state<OwnerShockerResponse[]>([]);

export const sharedHubsState = {
  get value() {
    return sharedHubs;
  },
};

export async function refreshSharedHubs() {
  try {
    const response = await shockerListSharedShockers();
    if (!response.data) {
      throw new Error(`Failed to fetch shared devices: ${response.message}`);
    }
    sharedHubs = response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
