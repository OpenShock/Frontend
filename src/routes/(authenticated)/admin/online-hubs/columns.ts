import type { ColumnDef, StringOrTemplateHeader } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { SemVer } from 'semver';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import { durationToString } from '$lib/utils/time';
import type { TwColor } from "$lib/types/Tailwind";
import DataTableActions from './data-table-actions.svelte';
import { getReadableUserAgentName } from '$lib/utils/userAgent';
import DataTableSortButton from './data-table-sort-button.svelte';

export type OnlineHubOwner = {
  id: string;
  name: string;
  image: string;
};
export type OnlineHub = {
  id: string;
  name: string;
  owner: OnlineHubOwner;
  firmware_version: SemVer;
  gateway: string;
  connected_at: Date;
  user_agent: string | null;
  booted_at: Date;
  latency: number | null;
  rssi: number | null;
};

function CreateSortHeader<TData>(name: string): StringOrTemplateHeader<TData, unknown> {
  return ({ column }) =>
    renderComponent(DataTableSortButton, {
      name,
      onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    });
}

export const columns: ColumnDef<OnlineHub>[] = [
  {
    accessorKey: 'name',
    header: CreateSortHeader('Name'),
  },
  {
    accessorKey: 'owner',
    header: CreateSortHeader('Owner'),
    cell: ({ row }) => {
      const ownerCellSnippet = createRawSnippet<[OnlineHubOwner]>((getOwner) => {
        const owner = getOwner();
        return {
          render: () => `<div class="text-left font-medium" title="${owner.id}">${owner.name}</div>`,
        }
      });

      return renderSnippet(ownerCellSnippet, row.getValue<OnlineHubOwner>('owner'));
    },
    sortingFn: (row_a, row_b) => {
      const a = row_a.getValue<OnlineHubOwner>('owner');
      const b = row_b.getValue<OnlineHubOwner>('owner');

      return a.name.localeCompare(b.name);
    }
  },
  {
    accessorKey: 'firmware_version',
    header: CreateSortHeader('Firmware Version'),
    cell: ({ row }) => {
      const firmwareVersionCellSnippet = createRawSnippet<[string]>((getFirmwareVersion) => {
        let firmwareVersion = getFirmwareVersion().toString();

        let color: `text-${TwColor}`;
        if (firmwareVersion.length <= 0) {
          firmwareVersion = 'Invalid';
          color = 'text-red-500';
        } else if (firmwareVersion === '0.0.0-local') {
          color = 'text-orange-500';
        }

        return {
          render: () => `<div class="text-left font-medium ${color}" title="${firmwareVersion}">${firmwareVersion}</div>`,
        }
      });

      return renderSnippet(firmwareVersionCellSnippet, row.getValue<string>('firmware_version'));
    },
    sortingFn: (row_a, row_b) => {
      const a = new SemVer(row_a.getValue<string>('firmware_version'));
      const b = new SemVer(row_b.getValue<string>('firmware_version'));

      if (a === b) return 0;

      return a.compare(b);
    }
  },
  {
    accessorKey: 'gateway',
    header: 'Gateway',
  },
  {
    accessorKey: 'connected_at',
    header: CreateSortHeader('Online for'),
    cell: ({ row }) => {
      const connectedAtCellSnippet = createRawSnippet<[Date]>((getConnectedAt) => {
        const now = Date.now();
        const connectedAt = getConnectedAt();
        const formattedDuration = durationToString(now - connectedAt.getTime());
        return {
          render: () => `<div class="text-left font-medium" title="${connectedAt}">${formattedDuration}</div>`,
        }
      });

      return renderSnippet(connectedAtCellSnippet, row.getValue<Date>('connected_at'));
    }
  },
  {
    accessorKey: 'user_agent',
    header: 'User Agent',
    cell: ({ row }) => {
      const userAgentCellSnippet = createRawSnippet<[string | null]>((getUserAgent) => {
        const userAgent = getUserAgent();
        const readableName = userAgent ? getReadableUserAgentName(userAgent) : 'Unknown';

        let color: `` | `text-${TwColor}` = '';
        if (!userAgent) {
          color = 'text-red-500';
        } else if (!readableName) {
          color = 'text-orange-500';
        }


        return {
          render: () => `<div class="text-left font-medium ${color}" title="${userAgent}">${readableName ?? userAgent}</div>`,
        }
      });

      return renderSnippet(userAgentCellSnippet, row.getValue<string | null>('user_agent'));
    }
  },
  {
    accessorKey: 'booted_at',
    header: CreateSortHeader('Uptime'),
    cell: ({ row }) => {
      const bootedAtCellSnippet = createRawSnippet<[Date]>((getBootedAt) => {
        const bootedAt = getBootedAt();
        const now = Date.now();
        const formattedDuration = durationToString(now - bootedAt.getTime());
        return {
          render: () => `<div class="text-left font-medium" title="${bootedAt}">${formattedDuration}</div>`,
        }
      });

      return renderSnippet(bootedAtCellSnippet, row.getValue<Date>('booted_at'));
    }
  },
  {
    accessorKey: 'latency',
    header: CreateSortHeader('Latency'),
    cell: ({ row }) => {
      const latencyCellSnippet = createRawSnippet<[number | null]>((getLatency) => {
        const latency = getLatency();
        if (!latency) {
          return {
            render: () => `<div class="text-left font-medium" title="N/A">N/A</div>`,
          }
        }

        return {
          render: () => `<div class="text-left font-medium" title="${latency}">${latency}</div>`,
        }
      });

      return renderSnippet(latencyCellSnippet, row.getValue<number | null>('latency'));
    }
  },
  {
    accessorKey: 'rssi',
    header: CreateSortHeader('RSSI'),
    cell: ({ row }) => {
      const rssiCellSnippet = createRawSnippet<[number | null]>((getRssi) => {
        const rssi = getRssi();
        if (!rssi) {
          return {
            render: () => `<div class="text-left font-medium" title="N/A">N/A</div>`,
          }
        }

        return {
          render: () => `<div class="text-left font-medium" title="${rssi}">${rssi}</div>`,
        }
      });

      return renderSnippet(rssiCellSnippet, row.getValue<number | null>('rssi'));
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { hub: row.original });
    }
  }
];
