import type { ColumnDef, StringOrTemplateHeader } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import { PasswordHashingAlgorithm, RoleType } from '$lib/api/internal/v1';
import DataTableSortButton from './data-table-sort-button.svelte';
import DataTableActions from './data-table-actions.svelte';

export type User = {
  id: string;
  name: string;
  email: string;
  password_hash_type: PasswordHashingAlgorithm;
  created_at: Date;
  email_activated: boolean;
  roles: RoleType[];
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
        const isLegacy = passwordHashType !== PasswordHashingAlgorithm.BCrypt;
        return {
          render: () =>
            `<div class="text-center font-medium ${isLegacy ? 'text-orange-500' : ''}">${passwordHashType}</div>`,
        };
      });

      return renderSnippet(passwordHashTypeCellSnippet, row.getValue<string>('password_hash_type'));
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

      return renderSnippet(createdAtCellSnippet, row.getValue<Date>('created_at'));
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

      return renderSnippet(emailActivatedCellSnippet, row.getValue<boolean>('email_activated'));
    },
  },
  {
    accessorKey: 'roles',
    header: CreateSortHeader<User>('Roles'),
    cell: ({ row }) => {
      const rolesCellSnippet = createRawSnippet<[RoleType[]]>((getRoles) => {
        const roles = getRoles();
        const isPrivileged = [RoleType.Admin, RoleType.System].some((role) => roles.includes(role));
        return {
          render: () =>
            `<div class="text-center font-medium ${isPrivileged ? 'text-blue-500' : ''}">${roles}</div>`,
        };
      });

      return renderSnippet(rolesCellSnippet, row.getValue<RoleType[]>('roles'));
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { user: row.original });
    },
  },
];
