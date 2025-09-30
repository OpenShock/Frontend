import { shockerSharesV2Api } from '$lib/api';
import type { ShareInviteBaseDetails, V2UserShares } from '$lib/api/internal/v2';
import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
import { writable } from 'svelte/store';

export const UserShares = writable<V2UserShares>({ outgoing: [], incoming: [] });
export const OutgoingOutstandingInvites = writable<ShareInviteBaseDetails[]>([]);

export async function refreshUserShares() {
  try {
    UserShares.set(await shockerSharesV2Api.userSharesGetSharesByUsers());
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function refreshOutgoingInvites() {
  try {
    OutgoingOutstandingInvites.set(await shockerSharesV2Api.userSharesGetOutgoingInvitesList());
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
