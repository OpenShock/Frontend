import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import { elapsedToString } from '$lib/utils/time';
import { getReadableUserAgentName } from '$lib/utils/userAgent';
import type { ColumnDef, StringOrTemplateHeader } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import DataTableActions from './data-table-actions.svelte';
import DataTableSortButton from './data-table-sort-button.svelte';

export type Session = {
  id: string;
  ip: string;
  user_agent: string;
  created_at: Date;
  expires_at: Date;
  last_seen: Date | null;
};

function CreateSortHeader<TData>(name: string): StringOrTemplateHeader<TData, unknown> {
  return ({ column }) =>
    renderComponent(DataTableSortButton, {
      name,
      onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    });
}

export const columns: ColumnDef<Session>[] = [
  {
    accessorKey: 'ip',
    header: 'Ip',
  },
  {
    accessorKey: 'user_agent',
    header: CreateSortHeader('User Agent'),
    cell: ({ row }) => {
      const userAgentCellSnippet = createRawSnippet<[string]>((getUserAgent) => {
        const userAgent = getUserAgent();
        const readableUserAgent = getReadableUserAgentName(userAgent);
        return {
          render: () => `<div class="text-left font-medium" title="${userAgent}">${readableUserAgent ?? userAgent}</div>`,
        }
      });

      return renderSnippet(userAgentCellSnippet, row.getValue<string>('user_agent'));
    }
  },
  {
    accessorKey: 'created_at',
    header: CreateSortHeader('Created at'),
    cell: ({ row }) => {
      const createdAtCellSnippet = createRawSnippet<[Date]>((getCreatedAt) => {
        const now = Date.now();
        const createdAt = getCreatedAt();
        const formattedTimeSpan = elapsedToString(now - createdAt.getTime());
        return {
          render: () => `<div class="text-right font-medium" title="${createdAt}">${formattedTimeSpan}</div>`,
        }
      });

      return renderSnippet(createdAtCellSnippet, row.getValue<Date>('created_at'));
    }
  },
  {
    accessorKey: 'expires_at',
    header: CreateSortHeader('Expires at'),
    cell: ({ row }) => {
      const expiresAtCellSnippet = createRawSnippet<[Date]>((getExpiresAt) => {
        const now = Date.now();
        const expiresAt = getExpiresAt();
        const formattedTimeSpan = elapsedToString(expiresAt.getTime() - now);
        return {
          render: () => `<div class="text-right font-medium" title="${expiresAt}">${formattedTimeSpan}</div>`,
        }
      });

      return renderSnippet(expiresAtCellSnippet, row.getValue<Date>('expires_at'));
    }
  },
  {
    accessorKey: 'last_seen',
    header: CreateSortHeader('Last seen'),
    cell: ({ row }) => {
      const lastSeenCellSnippet = createRawSnippet<[Date | null]>((getLastSeen) => {
        const lastSeen = getLastSeen();
        if (!lastSeen) {
          return {
            render: () => `<div class="text-left font-medium" title="N/A">N/A</div>`,
          }
        }

        const now = Date.now();
        const formattedTimeSpan = elapsedToString(lastSeen.getTime() - now);
        return {
          render: () => `<div class="text-right font-medium" title="${lastSeen}">${formattedTimeSpan}</div>`,
        }
      });

      return renderSnippet(lastSeenCellSnippet, row.getValue<Date | null>('last_seen'));
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { session: row.original });
    }
  }
];
