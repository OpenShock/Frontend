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

export type Session = {
  id: string;
  ip: string;
  user_agent: string;
  created_at: Date;
  expires_at: Date;
  last_seen: Date | null;
};

export const columns: ColumnDef<Session>[] = [
  CreateColumnDef('ip', 'Ip', RenderCell),
  CreateSortableColumnDef('user_agent', 'User Agent', UserAgentRenderer),
  CreateSortableColumnDef('created_at', 'Created at', TimeSinceRelativeRenderer),
  CreateSortableColumnDef('expires_at', 'Expires at', TimeSinceRelativeRenderer),
  CreateSortableColumnDef('last_seen', 'Last seen', TimeSinceRelativeOrNeverRenderer),
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { session: row.original });
    },
  },
];
