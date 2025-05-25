import type { ColumnDef } from '@tanstack/table-core';
import { type WebhookDto } from '$lib/api/internal/v1';
import {
  CreateSortableColumnDef,
  LocaleDateTimeRenderer,
  RenderCell,
} from '$lib/components/Table/ColumnUtils';
import { renderComponent } from '$lib/components/ui/data-table';
import DataTableActions from './data-table-actions.svelte';

export const columns: ColumnDef<WebhookDto>[] = [
  CreateSortableColumnDef('name', 'Name', RenderCell),
  CreateSortableColumnDef('url', 'Url', RenderCell),
  CreateSortableColumnDef('createdAt', 'Created at', LocaleDateTimeRenderer),
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { webhook: row.original });
    },
  },
];
