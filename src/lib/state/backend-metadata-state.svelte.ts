import { metaApi } from '$lib/api';
import type { BackendInfoResponse } from '$lib/api/internal/v1';

let _state = $state<BackendInfoResponse | null>(null);

export const backendMetadata = {
  get state() {
    return _state;
  },
  init: async () => {
    const response = await metaApi.versionGetBackendInfo();
    if (!response.data) throw new Error(`Failed to get backend info: ${response.message}`);

    const responseData = response.data;
    _state = responseData;
    return responseData;
  },
};
