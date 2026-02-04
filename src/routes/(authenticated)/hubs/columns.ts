import { ShockerModelType } from '$lib/api/internal/v1';
import {
  CellGreenOnline,
  CellRedOffline,
  CreateSortableColumnDef,
  FirmwareVersionRenderer,
  LocaleDateTimeRenderer,
  RenderCell,
} from '$lib/components/Table/ColumnUtils';
import { renderComponent } from '$lib/components/ui/data-table';
import type { ColumnDef } from '@tanstack/table-core';
import type { SemVer } from 'semver';
import DataTableActions from './data-table-actions.svelte';

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
  CreateSortableColumnDef('name', 'Name', RenderCell),
  CreateSortableColumnDef('is_online', 'Status', IsOnlineRenderer),
  CreateSortableColumnDef('firmware_version', 'Version', FirmwareVersionRenderer),
  CreateSortableColumnDef('created_at', 'Created at', LocaleDateTimeRenderer),
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { hub: row.original });
    },
  },
];
