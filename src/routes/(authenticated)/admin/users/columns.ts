import type { ColumnDef, StringOrTemplateHeader } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import { RankType } from '$lib/api/internal/v1';
import DataTableSortButton from './data-table-sort-button.svelte';
import DataTableActions from './data-table-actions.svelte';

export type User = {
  id: string;
  name: string;
  email: string;
  password_hash_type: PasswordHasing;
  created_at: Date;
  email_activated: boolean;
  rank: RankType;
};

function CreateSortHeader<TData>(name: string): StringOrTemplateHeader<TData, unknown> {
  return ({ column }) =>
    renderComponent(DataTableSortButton, {
      name,
      onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    });
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: CreateSortHeader<User>('Name'),
  },
  {
    accessorKey: 'email',
    header: CreateSortHeader<User>('Email'),
  },
  {
    accessorKey: 'password_hash_type',
    header: CreateSortHeader<User>('Password hash type'),
    cell: ({ row }) => {
      const passwordHashTypeCellSnippet = createRawSnippet<[string]>((getPasswordHashType) => {
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
    header: CreateSortHeader<User>('Created at'),
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
    header: CreateSortHeader<User>('Email activated'),
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
    header: CreateSortHeader<User>('Rank'),
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
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { id: row.original.id });
    }
  }
];
