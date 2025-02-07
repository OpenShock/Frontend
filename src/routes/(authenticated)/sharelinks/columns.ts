import type { ColumnDef, StringOrTemplateHeader } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import DataTableSortButton from './data-table-sort-button.svelte';
import DataTableActions from './data-table-actions.svelte';

export type ShareLink = {
  id: string;
  name: string;
  created_at: Date;
  expires_at: Date | null | undefined;
};

function CreateSortHeader<TData>(name: string): StringOrTemplateHeader<TData, unknown> {
  return ({ column }) =>
    renderComponent(DataTableSortButton, {
      name,
      onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    });
}

export const columns: ColumnDef<ShareLink>[] = [
  {
    accessorKey: 'name',
    header: CreateSortHeader<ShareLink>('Name'),
  },
  {
    accessorKey: 'created_at',
    header: CreateSortHeader<ShareLink>('Created at'),
    cell: ({ row }) => {
      const createdAtCellSnippet = createRawSnippet<[Date]>((getCreatedAt) => {
        const createdAt = getCreatedAt();
        return {
          render: () =>
            `<div class="text-right font-medium" title="${createdAt}">${createdAt.toLocaleString()}</div>`,
        };
      });

      return renderSnippet(createdAtCellSnippet, row.getValue<Date>('created_at'));
    },
  },
  {
    accessorKey: 'expires_at',
    header: CreateSortHeader<ShareLink>('Expires at'),
    cell: ({ row }) => {
      const expiresAtCellSnippet = createRawSnippet<[Date]>((getExpiresAt) => {
        const expiresAt = getExpiresAt();
        return {
          render: () =>
            `<div class="text-right font-medium" title="${expiresAt}">${expiresAt.toLocaleString()}</div>`,
        };
      });

      return renderSnippet(expiresAtCellSnippet, row.getValue<Date>('expires_at'));
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { sharelink: row.original });
    },
  },
];
