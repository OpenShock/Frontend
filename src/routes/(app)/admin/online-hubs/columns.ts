import type { AdminOnlineDeviceResponse } from '$lib/api';
import {
  CreateColumnDefs,
  FirmwareVersionRenderer,
  NumberRenderer,
  RenderCell,
  RenderCellWithTooltip,
  TimeSinceDurationRenderer,
  UserAgentRenderer,
} from '$lib/components/Table/ColumnUtils';
import { createNowTicker } from '$lib/utils/datetime.svelte';
import { SemVer } from 'semver';
import DataTableActions from './data-table-actions.svelte';
import type { Features } from './data-table-features';

export type OnlineHub = Omit<AdminOnlineDeviceResponse, 'firmwareVersion'> & {
  firmwareVersion: SemVer;
};

const { CreateColumnDef, CreateSortableColumnDef, CreateActionsColumnDef } = CreateColumnDefs<
  Features,
  OnlineHub
>();

// "Online for" and "Uptime" count up from a fixed instant, so their cells read
// the clock as they render. That read is what subscribes them to the tick — and
// it costs nothing while the table isn't mounted, so the columns can stay
// static, as TanStack requires.
const clock = createNowTicker();

export const columns = [
  CreateSortableColumnDef('name', 'Name', RenderCell),
  CreateSortableColumnDef(
    'owner',
    'Owner',
    (owner) => RenderCellWithTooltip(owner.name, owner.id),
    (a, b) => {
      if (a === b) return 0;
      return a.name.localeCompare(b.name);
    }
  ),
  CreateSortableColumnDef(
    'firmwareVersion',
    'Firmware Version',
    FirmwareVersionRenderer,
    (a, b) => {
      if (a === b) return 0;
      return a.compare(b);
    }
  ),
  CreateColumnDef('gateway', 'Gateway', RenderCell),
  CreateSortableColumnDef('connectedAt', 'Online for', (i) =>
    TimeSinceDurationRenderer(i, clock.current)
  ),
  CreateColumnDef('userAgent', 'User Agent', UserAgentRenderer),
  CreateSortableColumnDef('bootedAt', 'Uptime', (i) => TimeSinceDurationRenderer(i, clock.current)),
  CreateSortableColumnDef('latencyMs', 'Latency', NumberRenderer),
  CreateSortableColumnDef('rssi', 'RSSI', NumberRenderer),
  CreateActionsColumnDef(DataTableActions, (hub) => ({ hub })),
];
