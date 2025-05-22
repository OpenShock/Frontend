import type { ColumnDef } from '@tanstack/table-core';
import type { OwnPublicShareResponse } from '$lib/api/internal/v1';
import {
  CreateSortableColumnDef,
  LocaleDateTimeRenderer,
  RenderCell,
  TimeSinceRelativeOrNeverRenderer,
} from '$lib/components/Table/ColumnUtils';
import { renderComponent } from '$lib/components/ui/data-table';
import DataTableActions from './data-table-actions.svelte';

export const columns: ColumnDef<OwnPublicShareResponse>[] = [
  CreateSortableColumnDef('name', 'Name', RenderCell),
  CreateSortableColumnDef('createdOn', 'Created at', LocaleDateTimeRenderer),
  CreateSortableColumnDef('expiresOn', 'Expires', TimeSinceRelativeOrNeverRenderer),
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { publicShare: row.original });
    },
  },
];
