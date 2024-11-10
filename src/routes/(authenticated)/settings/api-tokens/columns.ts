import type { ColumnDef, StringOrTemplateHeader } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import { PermissionType } from '$lib/api/internal/v1';
import DataTableSortButton from './data-table-sort-button.svelte';
import DataTableActions from './data-table-actions.svelte';
import { elapsedToString } from '$lib/utils/time';

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
            `<div class="text-right font-medium" title="${createdAt}">${createdAt.toLocaleDateString()}</div>`,
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

        if(expiresAt === null) {
          return {
            render: () => '<div class="text-right font-medium text-orange-500">Never</div>',
          };
        }
        const now = Date.now();
        const formattedTimeSpan = elapsedToString(expiresAt.getTime() - now);
        return {
          render: () => `<div class="text-right font-medium" title="${expiresAt}">${formattedTimeSpan}</div>`,
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
        const isNever = lastUsed.getTime() < 0;

        if(isNever) {
          return {
            render: () => '<div class="text-right font-medium text-orange-500">Never</div>',
          };
        }

        const now = Date.now();
        const formattedTimeSpan = elapsedToString(lastUsed.getTime() - now);
        return {
          render: () => `<div class="text-right font-medium" title="${lastUsed}">${formattedTimeSpan}</div>`,
        };
      });

      return renderSnippet(lastUsedCellSnippet, row.getValue<Date>('last_used'));
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { token: row.original });
    }
  },
];
