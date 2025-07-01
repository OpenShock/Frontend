import type { ColumnDef } from '@tanstack/table-core';
import {
  CreateColumnDef,
  CreateSortableColumnDef,
  RenderCell,
  TimeSinceRelativeOrNeverRenderer,
  TimeSinceRelativeRenderer,
  UserAgentRenderer,
} from '$lib/components/Table/ColumnUtils';
import { renderComponent } from '$lib/components/ui/data-table';
import DataTableActions from './data-table-actions.svelte';
import type { LoginSessionResponse } from '$lib/api/internal/v1';

export const columns: ColumnDef<LoginSessionResponse>[] = [
  CreateColumnDef('ip', 'Ip', RenderCell),
  CreateSortableColumnDef('userAgent', 'User Agent', UserAgentRenderer),
  CreateSortableColumnDef('created', 'Created at', TimeSinceRelativeRenderer),
  CreateSortableColumnDef('expires', 'Expires at', TimeSinceRelativeRenderer),
  CreateSortableColumnDef('lastUsed', 'Last seen', TimeSinceRelativeOrNeverRenderer),
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { session: row.original });
    },
  },
];
