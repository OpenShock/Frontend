import { renderComponent } from '$lib/components/ui/data-table';
import type { ColumnDef } from '@tanstack/table-core';
import DataTableActions from './data-table-actions.svelte';
import {
  CreateSimpleCellSnippet,
  CreateSortHeader,
  TimeSinceRelativeOrNeverRenderer,
  TimeSinceRelativeRenderer,
  UserAgentRenderer,
} from '$lib/components/Table/ColumnUtils';

export type Session = {
  id: string;
  ip: string;
  user_agent: string;
  created_at: Date;
  expires_at: Date;
  last_seen: Date | null;
};

export const columns: ColumnDef<Session>[] = [
  {
    accessorKey: 'ip',
    header: 'Ip',
  },
  {
    accessorKey: 'user_agent',
    header: CreateSortHeader('User Agent'),
    cell: CreateSimpleCellSnippet('user_agent', UserAgentRenderer),
  },
  {
    accessorKey: 'created_at',
    header: CreateSortHeader('Created at'),
    cell: CreateSimpleCellSnippet('created_at', TimeSinceRelativeRenderer),
  },
  {
    accessorKey: 'expires_at',
    header: CreateSortHeader('Expires at'),
    cell: CreateSimpleCellSnippet('expires_at', TimeSinceRelativeRenderer),
  },
  {
    accessorKey: 'last_seen',
    header: CreateSortHeader('Last seen'),
    cell: CreateSimpleCellSnippet('last_seen', TimeSinceRelativeOrNeverRenderer),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { session: row.original });
    },
  },
];
