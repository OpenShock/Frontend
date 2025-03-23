import type { ColumnDef, StringOrTemplateHeader } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import { ShockerModelType } from '$lib/api/internal/v1';
import DataTableSortButton from '$lib/components/Table/SortButton.svelte';
import DataTableActions from './data-table-actions.svelte';
import type { SemVer } from 'semver';

export type Shocker = {
  id: string;
  rf_id: number;
  model: ShockerModelType;
  name: string;
  is_paused: boolean;
  created_at: Date;
};
export type Hub = {
  id: string;
  name: string;
  is_online: boolean;
  firmware_version: SemVer | null;
  shockers: Shocker[];
  created_at: Date;
};

function CreateSortHeader<TData>(name: string): StringOrTemplateHeader<TData, unknown> {
  return ({ column }) =>
    renderComponent(DataTableSortButton, {
      name,
      onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    });
}

export const columns: ColumnDef<Hub>[] = [
  {
    accessorKey: 'name',
    header: CreateSortHeader<Hub>('Name'),
  },
  {
    accessorKey: 'is_online',
    header: CreateSortHeader<Hub>('Status'),
    cell: ({ row }) => {
      const isOnlineCellSnippet = createRawSnippet<[boolean]>((getIsOnline) => {
        const isOnline = getIsOnline();
        return {
          render: () =>
            `<div class="text-center font-medium ${isOnline ? 'text-green-500' : 'text-red-500'}">${isOnline ? 'Online' : 'Offline'}</div>`,
        };
      });

      return renderSnippet(isOnlineCellSnippet, row.getValue<boolean>('is_online'));
    },
  },
  {
    accessorKey: 'firmware_version',
    header: CreateSortHeader<Hub>('Version'),
    cell: ({ row }) => {
      const versionCellSnippet = createRawSnippet<[SemVer | null]>((getFirmwareVersion) => {
        const firmwareVersion = getFirmwareVersion();
        return {
          render: () =>
            `<div class="text-center font-medium">${firmwareVersion?.format() ?? ''}</div>`,
        };
      });

      return renderSnippet(versionCellSnippet, row.getValue<SemVer | null>('firmware_version'));
    },
  },
  {
    accessorKey: 'created_at',
    header: CreateSortHeader<Hub>('Created at'),
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
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { hub: row.original });
    },
  },
];
