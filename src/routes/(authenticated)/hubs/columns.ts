import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table';
import { ShockerModelType } from '$lib/api/internal/v1';
import DataTableActions from './data-table-actions.svelte';
import type { SemVer } from 'semver';
import {
  CellGreenOnline,
  CellRedOffline,
  CreateSimpleCellSnippet,
  CreateSortHeader,
  FirmwareVersionRenderer,
  LocaleDateTimeRenderer,
} from '$lib/components/Table/ColumnUtils';

export type Shocker = {
  id: string;
  rf_id: number;
  model: ShockerModelType;
  name: string;
  is_paused: boolean;
  created_at: Date;
};
export type Hub = {
  id: string;
  name: string;
  is_online: boolean;
  firmware_version: SemVer | null;
  shockers: Shocker[];
  created_at: Date;
};

const IsOnlineRenderer = (isOnline: boolean) => (isOnline ? CellGreenOnline : CellRedOffline);

export const columns: ColumnDef<Hub>[] = [
  {
    accessorKey: 'name',
    header: CreateSortHeader('Name'),
  },
  {
    accessorKey: 'is_online',
    header: CreateSortHeader('Status'),
    cell: CreateSimpleCellSnippet('is_online', IsOnlineRenderer),
  },
  {
    accessorKey: 'firmware_version',
    header: CreateSortHeader('Version'),
    cell: CreateSimpleCellSnippet('firmware_version', FirmwareVersionRenderer),
  },
  {
    accessorKey: 'created_at',
    header: CreateSortHeader('Created at'),
    cell: CreateSimpleCellSnippet('created_at', LocaleDateTimeRenderer),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { hub: row.original });
    },
  },
];
