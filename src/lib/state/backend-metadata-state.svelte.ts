import { metaApi } from '$lib/api';
import type { BackendInfoResponse } from '$lib/api/internal/v1';

let _data = $state<BackendInfoResponse | null>(null);

export const backendMetadata = {
  get state() {
    return _data;
  },
  fetch: async () => {
    if (_data == null) {
      const { data } = await metaApi.versionGetBackendInfo();

      _data = data;
    }

    return _data;
  },
  setAuthenticated: (authenticated: boolean) => {
    if (!_data) return;
    _data.isUserAuthenticated = authenticated;
  }
}