import { getFirmwareRepoURL } from '$lib/utils/url';
import { GetJson } from './base';
import type {
  FirmwareBoardRelease,
  FirmwareChannel,
  FirmwareRelease,
  FirmwareVersionHistory,
} from './models';
import {
  TransformFirmwareBoardRelease,
  TransformFirmwareRelease,
  TransformFirmwareVersionHistory,
} from './transformers';

/** Most recent published release for a channel, with every board. */
export async function FetchLatest(channel: FirmwareChannel): Promise<FirmwareRelease> {
  return GetJson(`2/firmware/latest/${channel}`, 200, TransformFirmwareRelease);
}

/**
 * Full release details for one version. Versions are globally unique, so this is not
 * scoped by channel.
 */
export async function FetchVersion(version: string): Promise<FirmwareRelease> {
  return GetJson(
    `2/firmware/versions/${encodeURIComponent(version)}`,
    200,
    TransformFirmwareRelease
  );
}

/** Artifacts for a single board in a single version. `board` is the board name. */
export async function FetchBoardRelease(
  version: string,
  board: string
): Promise<FirmwareBoardRelease> {
  return GetJson(
    `2/firmware/versions/${encodeURIComponent(version)}/${encodeURIComponent(board)}`,
    200,
    TransformFirmwareBoardRelease
  );
}

/** Paginated version history. Channel is an optional filter, passed as a query parameter. */
export async function FetchVersionHistory(
  channel?: FirmwareChannel | null,
  limit = 20,
  offset = 0
): Promise<FirmwareVersionHistory> {
  const url = getFirmwareRepoURL('2/firmware/versions');

  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', String(offset));
  if (channel) url.searchParams.set('channel', channel);

  return GetJson(url, 200, TransformFirmwareVersionHistory);
}
