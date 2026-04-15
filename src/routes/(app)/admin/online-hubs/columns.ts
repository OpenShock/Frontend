import type { AdminOnlineDeviceResponse } from '$lib/api/internal/v1';
import {
  CreateActionsColumnDef,
  CreateColumnDef,
  CreateSortableColumnDef,
  FirmwareVersionRenderer,
  NumberRenderer,
  RenderCell,
  RenderCellWithTooltip,
  TimeSinceDurationRenderer,
  UserAgentRenderer,
} from '$lib/components/Table/ColumnUtils';
import type { ColumnDef } from '@tanstack/table-core';
import { SemVer } from 'semver';
import DataTableActions from './data-table-actions.svelte';

export type OnlineHub = Omit<AdminOnlineDeviceResponse, 'firmwareVersion'> & {
  firmwareVersion: SemVer;
};

export const columns: ColumnDef<OnlineHub>[] = [
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
  CreateSortableColumnDef('connectedAt', 'Online for', TimeSinceDurationRenderer),
  CreateColumnDef('userAgent', 'User Agent', UserAgentRenderer),
  CreateSortableColumnDef('bootedAt', 'Uptime', TimeSinceDurationRenderer),
  CreateSortableColumnDef('latencyMs', 'Latency', NumberRenderer),
  CreateSortableColumnDef('rssi', 'RSSI', NumberRenderer),
  CreateActionsColumnDef(DataTableActions, (hub) => ({ hub })),
];
