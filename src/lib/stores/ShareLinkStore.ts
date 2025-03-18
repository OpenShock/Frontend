import { shareLinksApi } from '$lib/api';
import type { ShareLinkResponse } from '$lib/api/internal/v1';
import { writable } from 'svelte/store';

export type ShareLink = ShareLinkResponse;

export const ShareLinksStore = writable<Map<string, ShareLink>>(new Map());

export function refreshShareLinks() {
  shareLinksApi
    .shareLinksList()
    .then((shareLinks) => {
      if (shareLinks.data === null || shareLinks.data === undefined) {
        console.warn('Failed to get share links, but response was success!');
        return;
      }
      ShareLinksStore.set(new Map(shareLinks.data.map((s) => [s.id, s])));
    })
    .catch((error) => {
      console.error(error); // TODO: Show toast
    });
}

export function removeShareLink(id: string) {
  ShareLinksStore.update((state) => {
    state.delete(id);
    return state;
  });
}

export function initializeShareLinkStore() {
  refreshShareLinks();
}
