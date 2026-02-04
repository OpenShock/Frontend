import { shockersV1Api } from '$lib/api';
import type { OwnerShockerResponse } from '$lib/api/internal/v1';
import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
import { writable } from 'svelte/store';

export const SharedHubsStore = writable<OwnerShockerResponse[]>([]);

export async function refreshSharedHubs() {
  try {
    const response = await shockersV1Api.shockerListSharedShockers();
    if (!response.data) {
      throw new Error(`Failed to fetch shared devices: ${response.message}`);
    }
    SharedHubsStore.set(response.data);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
