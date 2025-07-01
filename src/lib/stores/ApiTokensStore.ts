import { apiTokensApi } from '$lib/api';
import type { TokenResponse } from '$lib/api/internal/v1';
import { writable } from 'svelte/store';

export type ApiToken = TokenResponse;

export const ApiTokensStore = writable<Map<string, ApiToken>>(new Map());

export function refreshApiToken(id: string) {
  apiTokensApi
    .tokensGetTokenById(id)
    .then((token) => {
      ApiTokensStore.update((state) => {
        state.set(token.id, token);
        return state;
      });
    })
    .catch((error) => {
      console.error(error); // TODO: Show toast
    });
}

export function updateOrRefreshApiToken(id: string, updater: (token: ApiToken) => ApiToken) {
  let updated = false;

  ApiTokensStore.update((state) => {
    const existingToken = state.get(id);
    if (existingToken) {
      state.set(id, updater(existingToken));
      updated = true;
    }
    return state;
  });

  if (!updated) {
    refreshApiToken(id);
  }
}

export function refreshApiTokens() {
  apiTokensApi
    .tokensListTokens()
    .then((tokens) => {
      ApiTokensStore.set(new Map(tokens.map((t) => [t.id, t])));
    })
    .catch((error) => {
      console.error(error); // TODO: Show toast
    });
}

export function deleteApiToken(id: string) {
  ApiTokensStore.update((state) => {
    state.delete(id);
    return state;
  });
}
