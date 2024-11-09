import { tokensApi } from "$lib/api";
import type { TokenResponse } from "$lib/api/internal/v1";
import { writable } from "svelte/store";

export type ApiToken = TokenResponse;

export const ApiTokensStore = writable<Map<string, ApiToken>>(new Map());

export function refreshApiToken(id: string) {
  tokensApi.tokensGetTokenById(id)
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

export function refreshApiTokens() {
  tokensApi.tokensListTokens()
    .then((tokens) => {
        ApiTokensStore.set(new Map(tokens.map((t) => [t.id, t])));
    })
    .catch((error) => {
      console.error(error); // TODO: Show toast
    });
}

export function initializeApiTokenStore() {
  refreshApiTokens();
}
