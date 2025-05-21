import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table';
import DataTableActions from './data-table-actions.svelte';
import {
  TimeSinceRelativeOrNeverRenderer,
  LocaleDateTimeRenderer,
  RenderCell,
  CreateSortableColumnDef,
} from '$lib/components/Table/ColumnUtils';

export type ShareLink = {
  id: string;
  name: string;
  created_at: Date;
  expires_at: Date | null | undefined;
};

export const columns: ColumnDef<ShareLink>[] = [
  CreateSortableColumnDef('name', 'Name', RenderCell),
  CreateSortableColumnDef('created_at', 'Created at', LocaleDateTimeRenderer),
  CreateSortableColumnDef('expires_at', 'Expires', TimeSinceRelativeOrNeverRenderer),
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { sharelink: row.original });
    },
  },
];
