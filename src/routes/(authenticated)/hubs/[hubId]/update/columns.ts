import type { ColumnDef, StringOrTemplateHeader } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import { OtaUpdateStatus, ShockerModelType, type OtaItem } from '$lib/api/internal/v1';
import DataTableSortButton from './data-table-sort-button.svelte';

export type OtaLog = {
  id: string;
  started_at: Date;
  status: OtaUpdateStatus;
  version: string;
  message: string | null;
};

function CreateSortHeader<TData>(name: string): StringOrTemplateHeader<TData, unknown> {
  return ({ column }) =>
    renderComponent(DataTableSortButton, {
      name,
      onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    });
}

export const columns: ColumnDef<OtaLog>[] = [
  {
    accessorKey: 'id',
    header: CreateSortHeader<OtaLog>('ID'),
  },
  {
    accessorKey: 'started_at',
    header: CreateSortHeader<OtaLog>('Started At'),
    cell: ({ row }) => {
      const startedAtCellSnippet = createRawSnippet<[Date]>((getStartedAt) => {
        const startedAt = getStartedAt();
        return {
          render: () =>
            `<div class="text-center font-medium">${startedAt}</div>`,
        };
      });

      return renderSnippet(startedAtCellSnippet, row.getValue<Date>('started_at'));
    },
  },
  {
    accessorKey: 'status',
    header: CreateSortHeader<OtaLog>('Status'),
    cell: ({ row }) => {
      const statusCellSnippet = createRawSnippet<[OtaUpdateStatus]>((getStatus) => {
        const firmwareVersion = getStatus();
        return {
          render: () =>
            `<div class="text-center font-medium">${firmwareVersion}</div>`,
        };
      });

      return renderSnippet(statusCellSnippet, row.getValue<OtaUpdateStatus>('status'));
    },
  },
  {
    accessorKey: 'version',
    header: CreateSortHeader<OtaLog>('Version'),
    cell: ({ row }) => {
      const statusCellSnippet = createRawSnippet<[OtaUpdateStatus]>((getStatus) => {
        const firmwareVersion = getStatus();
        return {
          render: () =>
            `<div class="text-center font-medium">${firmwareVersion}</div>`,
        };
      });

      return renderSnippet(statusCellSnippet, row.getValue<OtaUpdateStatus>('version'));
    },
  },
  {
    accessorKey: 'message',
    header: CreateSortHeader<OtaLog>('Message'),
    cell: ({ row }) => {
      const statusCellSnippet = createRawSnippet<[OtaUpdateStatus]>((getStatus) => {
        const firmwareVersion = getStatus();
        return {
          render: () =>
            `<div class="text-center font-medium">${firmwareVersion}</div>`,
        };
      });

      return renderSnippet(statusCellSnippet, row.getValue<OtaUpdateStatus>('message'));
    },
  }
];
