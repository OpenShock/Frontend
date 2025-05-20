import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table';
import DataTableActions from './data-table-actions.svelte';
import {
  CreateSimpleCellSnippet,
  CreateSortHeader,
  TimeSinceRelativeOrNeverRenderer,
  LocaleDateTimeRenderer,
} from '$lib/components/Table/ColumnUtils';

export type ShareLink = {
  id: string;
  name: string;
  created_at: Date;
  expires_at: Date | null | undefined;
};

export const columns: ColumnDef<ShareLink>[] = [
  {
    accessorKey: 'name',
    header: CreateSortHeader('Name'),
  },
  {
    accessorKey: 'created_at',
    header: CreateSortHeader('Created at'),
    cell: CreateSimpleCellSnippet('created_at', LocaleDateTimeRenderer),
  },
  {
    accessorKey: 'expires_at',
    header: CreateSortHeader('Expires'),
    cell: CreateSimpleCellSnippet('expires_at', TimeSinceRelativeOrNeverRenderer),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { sharelink: row.original });
    },
  },
];
