import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table';
import { PermissionType } from '$lib/api/internal/v1';
import DataTableActions from './data-table-actions.svelte';
import {
  CreateSimpleCellSnippet,
  CreateSortHeader,
  TimeSinceRelativeOrNeverRenderer,
  LocaleDateRenderer,
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
  {
    accessorKey: 'name',
    header: CreateSortHeader('Name'),
  },
  {
    accessorKey: 'created_at',
    header: CreateSortHeader('Created at'),
    cell: CreateSimpleCellSnippet('created_at', LocaleDateRenderer),
  },
  {
    accessorKey: 'expires_at',
    header: CreateSortHeader('Expires at'),
    cell: CreateSimpleCellSnippet('expires_at', TimeSinceRelativeOrNeverRenderer),
  },
  {
    accessorKey: 'last_used',
    header: CreateSortHeader('Last used'),
    cell: CreateSimpleCellSnippet('last_used', TimeSinceRelativeOrNeverRenderer),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { token: row.original });
    },
  },
];
