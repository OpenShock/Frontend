import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { SemVer } from 'semver';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import { durationToString } from '$lib/utils/time';
import DataTableNameButton from './data-table-name-button.svelte'
import DataTableOwnerButton from './data-table-owner-button.svelte'
import DataTableFirmwareVersionButton from './data-table-firmwareversion-button.svelte'
import DataTableOnlineForButton from './data-table-onlinefor-button.svelte'
import type { TwColor } from "$lib/types/Tailwind";

export type OnlineDeviceOwner = {
  id: string;
  name: string;
  image: string;
};
export type OnlineDevice = {
  id: string;
  name: string;
  owner: OnlineDeviceOwner;
  firmware_version: SemVer | null;
  gateway: string;
  connected_at: Date;
};

export const columns: ColumnDef<OnlineDevice>[] = [
  {
    accessorKey: 'id',
    header: 'Id',
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      renderComponent(DataTableNameButton, {
        onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    ),
  },
  {
    accessorKey: 'owner',
    header: ({ column }) => (
      renderComponent(DataTableOwnerButton, {
        onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    ),
    cell: ({ row }) => {
      const ownerCellSnippet = createRawSnippet<[OnlineDeviceOwner]>((getOwner) => {
        const owner = getOwner();
        return {
          render: () => `<div class="text-left font-medium" title="${owner.id}">${owner.name}</div>`,
        }
      });

      return renderSnippet(ownerCellSnippet, row.getValue('owner'));
    },
    sortingFn: (row_a, row_b) => {
      const a = row_a.getValue('owner') as OnlineDeviceOwner;
      const b = row_b.getValue('owner') as OnlineDeviceOwner;

      if (a === b) return 0;
      if (!a) return 1;
      if (!b) return -1;
      return a.name.localeCompare(b.name);
    }
  },
  {
    accessorKey: 'firmware_version',
    header: ({ column }) => (
      renderComponent(DataTableFirmwareVersionButton, {
        onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    ),
    cell: ({ row }) => {
      const firmwareVersionCellSnippet = createRawSnippet<[SemVer | null]>((getFirmwareVersion) => {
        let firmwareVersion = getFirmwareVersion()?.toString() ?? null;

        let color: `text-${TwColor}`;
        if (firmwareVersion === null) {
          firmwareVersion = 'Invalid';
          color = 'text-red-500';
        } else if (firmwareVersion === '0.0.0-local') {
          color = 'text-orange-500';
        }

        return {
          render: () => `<div class="text-left font-medium ${color}" title="${firmwareVersion}">${firmwareVersion}</div>`,
        }
      });

      return renderSnippet(firmwareVersionCellSnippet, row.getValue('firmware_version'));
    },
    sortingFn: (row_a, row_b) => {
      const a = row_a.getValue('firmware_version') as SemVer | null;
      const b = row_b.getValue('firmware_version') as SemVer | null;

      if (a === b) return 0;
      if (!a) return -1;
      if (!b) return 1;

      return a.compare(b);
    }
  },
  {
    accessorKey: 'gateway',
    header: 'Gateway',
  },
  {
    accessorKey: 'connected_at',
    header: ({ column }) => (
      renderComponent(DataTableOnlineForButton, {
        onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    ),
    cell: ({ row }) => {
      const connectedAtCellSnippet = createRawSnippet<[Date]>((getConnectedAt) => {
        const now = Date.now();
        const connectedAt = getConnectedAt();
        const formattedDuration = durationToString(now - connectedAt.getTime());
        return {
          render: () => `<div class="text-left font-medium" title="${connectedAt}">${formattedDuration}</div>`,
        }
      });

      return renderSnippet(connectedAtCellSnippet, row.getValue('connected_at'));
    }
  }
];
