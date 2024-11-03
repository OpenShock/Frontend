import type {ColumnDef} from '@tanstack/table-core';
import {createRawSnippet} from 'svelte';
import {renderComponent, renderSnippet} from '$lib/components/ui/data-table';
import DataTableNameButton from './data-table-name-button.svelte';
import DataTableEmailButton from './data-table-email-button.svelte';
import DataTablePasswordHashTypeButton from './data-table-passwordhashtype-button.svelte';
import DataTableCreatedAtButton from './data-table-createdat-button.svelte';
import DataTableEmailActivatedButton from './data-table-emailactivated-button.svelte';
import DataTableRankButton from './data-table-rank-button.svelte';
import {PasswordHashingAlgorithm, RankType} from '$lib/api/internal/v1';

export type User = {
  id: string;
  name: string;
  email: string;
  password_hash_type: PasswordHashingAlgorithm;
  created_at: Date;
  email_activated: boolean;
  rank: RankType;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'Id',
  },
  {
    accessorKey: 'name',
    header: ({ column }) =>
      renderComponent(DataTableNameButton, {
        onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }),
  },
  {
    accessorKey: 'email',
    header: ({ column }) =>
      renderComponent(DataTableEmailButton, {
        onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }),
  },
  {
    accessorKey: 'password_hash_type',
    header: ({ column }) =>
      renderComponent(DataTablePasswordHashTypeButton, {
        onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }),
    cell: ({ row }) => {
      const passwordHashTypeCellSnippet = createRawSnippet<[PasswordHashingAlgorithm]>((getPasswordHashType) => {
        const passwordHashType = getPasswordHashType();
        const isLegacy = passwordHashType !== PasswordHashingAlgorithm.bCrypt;
        return {
          render: () => `<div class="text-center font-medium ${isLegacy ? 'text-orange-500' : ''}">${passwordHashType}</div>`,
        };
      });

      return renderSnippet(passwordHashTypeCellSnippet, row.getValue('password_hash_type'));
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) =>
      renderComponent(DataTableCreatedAtButton, {
        onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }),
    cell: ({ row }) => {
      const createdAtCellSnippet = createRawSnippet<[Date]>((getCreatedAt) => {
        const createdAt = getCreatedAt();
        return {
          render: () =>
            `<div class="text-right font-medium" title="${createdAt}">${createdAt.toLocaleString()}</div>`,
        };
      });

      return renderSnippet(createdAtCellSnippet, row.getValue('created_at'));
    },
  },
  {
    accessorKey: 'email_activated',
    header: ({ column }) =>
      renderComponent(DataTableEmailActivatedButton, {
        onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }),
    cell: ({ row }) => {
      const emailActivatedCellSnippet = createRawSnippet<[boolean]>((getEmailActivated) => {
        const emailActivated = getEmailActivated();
        return {
          render: () =>
            `<div class="text-center font-medium ${emailActivated ? 'text-green-500' : 'text-red-500'}">${emailActivated}</div>`,
        };
      });

      return renderSnippet(emailActivatedCellSnippet, row.getValue('email_activated'));
    },
  },
  {
    accessorKey: 'rank',
    header: ({ column }) =>
      renderComponent(DataTableRankButton, {
        onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }),
    cell: ({ row }) => {
      const rankCellSnippet = createRawSnippet<[RankType]>((getRank) => {
        const rank = getRank();
        const isPrivileged = [RankType.admin, RankType.system].includes(rank);
        return {
          render: () =>
            `<div class="text-center font-medium ${isPrivileged ? 'text-blue-500' : ''}">${rank}</div>`,
        };
      });

      return renderSnippet(rankCellSnippet, row.getValue('rank'));
    },
  },
];
