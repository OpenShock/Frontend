import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import {elapsedToString} from '$lib/utils/time';
import DataTableCreatedAtButton from './data-table-createdat-button.svelte'
import DataTableUserAgentButton from './data-table-useragent-button.svelte'
import DataTableExpiresAtButton from './data-table-expiresat-button.svelte'
import {UAParser} from "ua-parser-js";
import DataTableActions from './data-table-actions.svelte';

export type Session = {
  id: string;
  ip: string;
  user_agent: string;
  created_at: Date;
  expires_at: Date;
};

function getReadableUserAgentName(userAgent: string): string {
  const ua = new UAParser(userAgent);

  const browser = ua.getBrowser();
  const os = ua.getOS();

  if (!browser.name || !os.name) return userAgent;

  let name = `${browser.name} on ${os.name}`;

  if (os.version) name += ` ${os.version}`;

  return name;
}

export const columns: ColumnDef<Session>[] = [
  {
    accessorKey: 'ip',
    header: 'Ip',
  },
  {
    accessorKey: 'user_agent',
    header: ({ column }) => (
      renderComponent(DataTableUserAgentButton, {
        onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    ),
    cell: ({ row }) => {
      const userAgentCellSnippet = createRawSnippet<[string]>((getUserAgent) => {
        const userAgent = getUserAgent();
        const readableUserAgent = getReadableUserAgentName(userAgent);
        return {
          render: () => `<div class="text-left font-medium" title="${userAgent}">${readableUserAgent}</div>`,
        }
      });

      return renderSnippet(userAgentCellSnippet, row.getValue('user_agent'));
    }
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      renderComponent(DataTableCreatedAtButton, {
        onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    ),
    cell: ({ row }) => {
      const createdAtCellSnippet = createRawSnippet<[Date]>((getCreatedAt) => {
        const now = Date.now();
        const createdAt = getCreatedAt();
        const formattedTimeSpan = elapsedToString(now - createdAt.getTime());
        return {
          render: () => `<div class="text-right font-medium" title="${createdAt}">${formattedTimeSpan}</div>`,
        }
      });

      return renderSnippet(createdAtCellSnippet, row.getValue('created_at'));
    }
  },
  {
    accessorKey: 'expires_at',
    header: ({ column }) => (
      renderComponent(DataTableExpiresAtButton, {
        onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    ),
    cell: ({ row }) => {
      const expiresAtCellSnippet = createRawSnippet<[Date]>((getExpiresAt) => {
        const now = Date.now();
        const expiresAt = getExpiresAt();
        const formattedTimeSpan = elapsedToString(expiresAt.getTime() - now);
        return {
          render: () => `<div class="text-right font-medium" title="${expiresAt}">${formattedTimeSpan}</div>`,
        }
      });

      return renderSnippet(expiresAtCellSnippet, row.getValue('expires_at'));
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { id: row.original.id });
    }
  }
];
