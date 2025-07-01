import type { ColumnDef } from '@tanstack/table-core';
import type { TokenResponse } from '$lib/api/internal/v1';
import {
  CreateSortableColumnDef,
  LocaleDateRenderer,
  RenderCell,
  TimeSinceRelativeOrNeverRenderer,
} from '$lib/components/Table/ColumnUtils';
import { renderComponent } from '$lib/components/ui/data-table';
import DataTableActions from './data-table-actions.svelte';

export const columns: ColumnDef<TokenResponse>[] = [
  CreateSortableColumnDef('name', 'Name', RenderCell),
  CreateSortableColumnDef('createdOn', 'Created at', LocaleDateRenderer),
  CreateSortableColumnDef('validUntil', 'Expires at', TimeSinceRelativeOrNeverRenderer),
  CreateSortableColumnDef('lastUsed', 'Last used', TimeSinceRelativeOrNeverRenderer),
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { token: row.original });
    },
  },
];
