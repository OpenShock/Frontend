import { shockerSharesV2Api } from '$lib/api';
import type { ShareInviteBaseDetails, V2UserShares } from '$lib/api/internal/v2';
import { handleApiError } from '$lib/errorhandling/apiErrorHandling';

let shares = $state<V2UserShares>({ outgoing: [], incoming: [] });
let outgoingInvites = $state<ShareInviteBaseDetails[]>([]);
let incomingInvites = $state<ShareInviteBaseDetails[]>([]);

export const userSharesState = {
  get shares() {
    return shares;
  },
  set shares(value: V2UserShares) {
    shares = value;
  },
  get outgoingInvites() {
    return outgoingInvites;
  },
  get incomingInvites() {
    return incomingInvites;
  },
};

export async function refreshUserShares() {
  try {
    shares = await shockerSharesV2Api.userSharesGetSharesByUsers();
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function refreshOutgoingInvites() {
  try {
    outgoingInvites = await shockerSharesV2Api.userSharesGetOutgoingInvitesList();
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function refreshIncomingInvites() {
  try {
    incomingInvites = await shockerSharesV2Api.userSharesGetIncomingInvitesList();
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
