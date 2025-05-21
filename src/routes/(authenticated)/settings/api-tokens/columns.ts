import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table';
import { PermissionType } from '$lib/api/internal/v1';
import DataTableActions from './data-table-actions.svelte';
import {
  TimeSinceRelativeOrNeverRenderer,
  LocaleDateRenderer,
  RenderCell,
  CreateSortableColumnDef,
} from '$lib/components/Table/ColumnUtils';

export type ApiToken = {
  id: string;
  name: string;
  created_at: Date;
  expires_at: Date | null;
  last_used: Date;
  permissions: PermissionType[];
};

export const columns: ColumnDef<ApiToken>[] = [
  CreateSortableColumnDef('name', 'Name', RenderCell),
  CreateSortableColumnDef('created_at', 'Created at', LocaleDateRenderer),
  CreateSortableColumnDef('expires_at', 'Expires at', TimeSinceRelativeOrNeverRenderer),
  CreateSortableColumnDef('last_used', 'Last used', TimeSinceRelativeOrNeverRenderer),
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { token: row.original });
    },
  },
];
