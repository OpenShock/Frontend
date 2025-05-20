import type { ColumnDef } from '@tanstack/table-core';
import { SemVer } from 'semver';
import { renderComponent } from '$lib/components/ui/data-table';
import DataTableActions from './data-table-actions.svelte';
import {
  CreateSimpleCellSnippet,
  CreateSortHeader,
  FirmwareVersionRenderer,
  NumberRenderer,
  RenderCellWithTooltip,
  TimeSinceDurationRenderer,
  UserAgentRenderer,
} from '$lib/components/Table/ColumnUtils';

export type OnlineHubOwner = {
  id: string;
  name: string;
  image: string;
};
export type OnlineHub = {
  id: string;
  name: string;
  owner: OnlineHubOwner;
  firmware_version: SemVer;
  gateway: string;
  connected_at: Date;
  user_agent: string | null;
  booted_at: Date;
  latency: number | null;
  rssi: number | null;
};

const OwnerRenderer = (owner: OnlineHubOwner) => RenderCellWithTooltip(owner.name, owner.id);

export const columns: ColumnDef<OnlineHub>[] = [
  {
    accessorKey: 'name',
    header: CreateSortHeader('Name'),
  },
  {
    accessorKey: 'owner',
    header: CreateSortHeader('Owner'),
    cell: CreateSimpleCellSnippet('owner', OwnerRenderer),
    sortingFn: (row_a, row_b) => {
      const a = row_a.getValue<OnlineHubOwner>('owner');
      const b = row_b.getValue<OnlineHubOwner>('owner');

      return a.name.localeCompare(b.name);
    },
  },
  {
    accessorKey: 'firmware_version',
    header: CreateSortHeader('Firmware Version'),
    cell: CreateSimpleCellSnippet('firmware_version', FirmwareVersionRenderer),
    sortingFn: (row_a, row_b) => {
      const a = new SemVer(row_a.getValue<string>('firmware_version'));
      const b = new SemVer(row_b.getValue<string>('firmware_version'));

      if (a === b) return 0;

      return a.compare(b);
    },
  },
  {
    accessorKey: 'gateway',
    header: 'Gateway',
  },
  {
    accessorKey: 'connected_at',
    header: CreateSortHeader('Online for'),
    cell: CreateSimpleCellSnippet('connected_at', TimeSinceDurationRenderer),
  },
  {
    accessorKey: 'user_agent',
    header: 'User Agent',
    cell: CreateSimpleCellSnippet('user_agent', UserAgentRenderer),
  },
  {
    accessorKey: 'booted_at',
    header: CreateSortHeader('Uptime'),
    cell: CreateSimpleCellSnippet('booted_at', TimeSinceDurationRenderer),
  },
  {
    accessorKey: 'latency',
    header: CreateSortHeader('Latency'),
    cell: CreateSimpleCellSnippet('latency', NumberRenderer),
  },
  {
    accessorKey: 'rssi',
    header: CreateSortHeader('RSSI'),
    cell: CreateSimpleCellSnippet('rssi', NumberRenderer),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { hub: row.original });
    },
  },
];
