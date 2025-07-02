import { isNumber } from '$lib/typeguards';

export enum HubUpdateType {
  HubCreated = 0,
  HubUpdated = 1,
  HubDeleted = 3,

  HubShockersUpdate = 2,
}

export function isHubUpdateType(value: unknown): value is HubUpdateType {
  return (
    isNumber(value) &&
    [
      HubUpdateType.HubCreated,
      HubUpdateType.HubUpdated,
      HubUpdateType.HubDeleted,
      HubUpdateType.HubShockersUpdate,
    ].includes(value)
  );
}
