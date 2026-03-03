import { metaApi } from '$lib/api';
import type { BackendInfoResponse } from '$lib/api/internal/v1';

let state = $state<BackendInfoResponse | null>(null);

export const backendMetadata = {
  get State() {
    return state;
  },
  init: async () => {
    const response = await metaApi.versionGetBackendInfo();
    if (!response.data) throw new Error(`Failed to get backend info: ${response.message}`);

    const responseData = response.data;
    state = responseData;
    return responseData;
  },
};
