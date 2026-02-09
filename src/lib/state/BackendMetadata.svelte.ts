import { metaApi } from '$lib/api';
import type { BackendInfoResponse } from '$lib/api/internal/v1';

let state = $state<BackendInfoResponse>({
  version: 'UNKNOWN',
  commit: 'UNKNOWN',
  currentTime: new Date(),
  frontendUrl: 'UNKNOWN',
  shortLinkUrl: 'UNKNOWN',
  turnstileSiteKey: 'UNKNOWN',
  oAuthProviders: [],
  isUserAuthenticated: false,
});

export const backendMetadata = {
  get State() {
    return state;
  },
  init: async () => {
    const response = await metaApi.versionGetBackendInfo();
    if (!response.data) throw new Error(`Failed to get backend info: ${response.message}`);

    state = response.data;
    return response.data;
  },
};
