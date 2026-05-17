import type { BackendInfoResponse } from '$lib/api/internal/v1';

export type BackendMetadata = Omit<BackendInfoResponse, 'isUserAuthenticated'>;

let _data = $state<BackendMetadata | null>(null);

export const backendMetadata = {
  get state() {
    return _data;
  },
  set(info: BackendInfoResponse) {
    const { isUserAuthenticated: _ignored, ...rest } = info;
    _data = rest;
  },
};
