import type { AdminOnlineDeviceResponse } from '#lib/api/index.js';
import {
  CellNotApplicable,
  CellRedUnknown,
  CreateColumnDefs,
  FirmwareVersionRenderer,
  RenderBoldCell,
  RenderCell,
  RenderCellWithTooltip,
  RenderGreenCell,
  RenderOrangeCell,
  RenderRedCell,
  TimeSinceDurationRenderer,
  UserAgentRenderer,
} from '#lib/components/Table/ColumnUtils.js';
import { countryName, getReadableUserAgentName } from '#lib/utils/index.js';
import { createNowTicker } from '@openshock/svelte-core/utils';
import { SemVer } from 'semver';
import DataTableActions from './data-table-actions.svelte';
import type { Features } from './data-table-features';

export type OnlineHub = Omit<AdminOnlineDeviceResponse, 'firmwareVersion'> & {
  firmwareVersion: SemVer;
  network: HubNetwork | null;
};

// The autonomous system the hub connected from, null when GeoIP could not resolve it.
export interface HubNetwork {
  asn: number;
  org: string | null;
}

export const asnLabel = (asn: number) => `AS${asn}`;

export const networkName = (network: HubNetwork) => network.org ?? asnLabel(network.asn);

export const WEAK_RSSI_DBM = -80;

export const HIGH_LATENCY_MS = 250;

const { CreateSortableColumnDef, CreateActionsColumnDef } = CreateColumnDefs<Features, OnlineHub>();

// "Online for" and "Uptime" count up from a fixed instant, so their cells read
// the clock as they render. That read is what subscribes them to the tick — and
// it costs nothing while the table isn't mounted, so the columns can stay
// static, as TanStack requires.
const clock = createNowTicker();

function LatencyRenderer(latencyMs: number | null) {
  if (latencyMs === null) return CellNotApplicable;
  const text = `${latencyMs} ms`;
  return latencyMs >= HIGH_LATENCY_MS ? RenderOrangeCell(text) : RenderBoldCell(text);
}

function CountryRenderer(code: string | null) {
  const name = countryName(code);
  return name && code ? RenderCellWithTooltip(name, code) : CellRedUnknown;
}

function NetworkRenderer(network: HubNetwork | null) {
  return network
    ? RenderCellWithTooltip(networkName(network), asnLabel(network.asn))
    : CellRedUnknown;
}

function RssiRenderer(rssi: number | null) {
  if (rssi === null) return CellNotApplicable;
  const text = `${rssi} dBm`;
  if (rssi <= WEAK_RSSI_DBM) return RenderRedCell(text);
  if (rssi <= -67) return RenderOrangeCell(text);
  return RenderGreenCell(text);
}

export const columns = [
  CreateSortableColumnDef('name', 'Name', RenderBoldCell),
  CreateSortableColumnDef(
    'owner',
    'Owner',
    (owner) => RenderCellWithTooltip(owner.name, owner.id),
    (a, b) => a.name.localeCompare(b.name)
  ),
  CreateSortableColumnDef('firmwareVersion', 'Firmware', FirmwareVersionRenderer, (a, b) =>
    a.compare(b)
  ),
  CreateSortableColumnDef('country', 'Country', CountryRenderer, (a, b) => {
    const nameA = countryName(a);
    const nameB = countryName(b);
    if (nameA === null || nameB === null) return nameA === nameB ? 0 : nameA === null ? 1 : -1;
    return nameA.localeCompare(nameB);
  }),
  CreateSortableColumnDef('network', 'Network', NetworkRenderer, (a, b) => {
    if (a === null || b === null) return a === b ? 0 : a === null ? 1 : -1;
    return networkName(a).localeCompare(networkName(b));
  }),
  CreateSortableColumnDef('gateway', 'Gateway', RenderCell),
  CreateSortableColumnDef('connectedAt', 'Online for', (i) =>
    TimeSinceDurationRenderer(i, clock.current)
  ),
  CreateSortableColumnDef('bootedAt', 'Uptime', (i) => TimeSinceDurationRenderer(i, clock.current)),
  CreateSortableColumnDef('latencyMs', 'Latency', LatencyRenderer),
  CreateSortableColumnDef('rssi', 'RSSI', RssiRenderer),
  CreateSortableColumnDef('ip', 'IP', (ip) => (ip ? RenderCell(ip) : CellRedUnknown)),
  CreateSortableColumnDef('userAgent', 'Hardware', UserAgentRenderer, (a, b) => {
    const nameA = a && getReadableUserAgentName(a);
    const nameB = b && getReadableUserAgentName(b);
    if (!nameA || !nameB) return nameA === nameB ? 0 : nameA ? -1 : 1;
    return nameA.localeCompare(nameB);
  }),
  CreateActionsColumnDef(DataTableActions, (hub) => ({ hub })),
];
