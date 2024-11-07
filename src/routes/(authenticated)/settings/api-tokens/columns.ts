import type { ColumnDef, StringOrTemplateHeader } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import { PermissionType } from '$lib/api/internal/v1';
import DataTableSortButton from './data-table-sort-button.svelte';
import DataTableActions from './data-table-actions.svelte';

export type ApiToken = {
  id: string;
  name: string;
  created_at: Date;
  expires_at: Date | null;
  last_used: Date;
  permissions: PermissionType[];
};

function CreateSortHeader<TData>(name: string): StringOrTemplateHeader<TData, unknown> {
  return ({ column }) =>
    renderComponent(DataTableSortButton, {
      name,
      onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    });
}

export const columns: ColumnDef<ApiToken>[] = [
  {
    accessorKey: 'name',
    header: CreateSortHeader<ApiToken>('Name'),
  },
  {
    accessorKey: 'created_at',
    header: CreateSortHeader<ApiToken>('Created at'),
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
    header: CreateSortHeader<ApiToken>('Expires at'),
    cell: ({ row }) => {
      const expiresAtCellSnippet = createRawSnippet<[Date | null]>((getExpiresAt) => {
        const expiresAt = getExpiresAt();
        return {
          render: () => expiresAt === null ? '<div class="text-right font-medium text-orange-500">Never</div>' :
            `<div class="text-right font-medium" title="${expiresAt}">${expiresAt.toLocaleString()}</div>`,
        };
      });

      return renderSnippet(expiresAtCellSnippet, row.getValue<Date | null>('expires_at'));
    },
  },
  {
    accessorKey: 'last_used',
    header: CreateSortHeader<ApiToken>('Last used'),
    cell: ({ row }) => {
      const lastUsedCellSnippet = createRawSnippet<[Date]>((getLastUsed) => {
        const lastUsed = getLastUsed();
        return {
          render: () => `<div class="text-right font-medium" title="${lastUsed}">${lastUsed.toLocaleString()}</div>`,
        };
      });

      return renderSnippet(lastUsedCellSnippet, row.getValue<Date>('last_used'));
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { id: row.original.id });
    }
  },
];
