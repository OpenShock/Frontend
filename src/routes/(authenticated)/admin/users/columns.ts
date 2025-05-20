import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table';
import { PasswordHashingAlgorithm, RoleType } from '$lib/api/internal/v1';
import DataTableActions from './data-table-actions.svelte';
import {
  CreateSimpleCellSnippet,
  CreateSortHeader,
  LocaleDateTimeRenderer,
} from '$lib/components/Table/ColumnUtils';

export type User = {
  id: string;
  name: string;
  email: string;
  password_hash_type: PasswordHashingAlgorithm;
  created_at: Date;
  email_activated: boolean;
  roles: RoleType[];
};

const PasswordHashTypeRenderer = (passwordHashType: PasswordHashingAlgorithm) => {
  const isLegacy = passwordHashType !== PasswordHashingAlgorithm.BCrypt;
  return `<div class="px-4 font-medium ${isLegacy ? 'text-orange-500' : ''}">${passwordHashType}</div>`;
};

const IsEmailActivatedRenderer = (emailActivated: boolean) =>
  `<div class="px-4 font-medium ${emailActivated ? 'text-green-500' : 'text-red-500'}">${emailActivated}</div>`;

const UserRolesRenderer = (roles: RoleType[]) => {
  const isPrivileged = [RoleType.Admin, RoleType.System].some((role) => roles.includes(role));
  return `<div class="px-4 font-medium ${isPrivileged ? 'text-blue-500' : ''}">${roles}</div>`;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: CreateSortHeader('Name'),
  },
  {
    accessorKey: 'email',
    header: CreateSortHeader('Email'),
  },
  {
    accessorKey: 'password_hash_type',
    header: CreateSortHeader('Password hash type'),
    cell: CreateSimpleCellSnippet('password_hash_type', PasswordHashTypeRenderer),
  },
  {
    accessorKey: 'created_at',
    header: CreateSortHeader('Created at'),
    cell: CreateSimpleCellSnippet('created_at', LocaleDateTimeRenderer),
  },
  {
    accessorKey: 'email_activated',
    header: CreateSortHeader('Email activated'),
    cell: CreateSimpleCellSnippet('email_activated', IsEmailActivatedRenderer),
  },
  {
    accessorKey: 'roles',
    header: CreateSortHeader('Roles'),
    cell: CreateSimpleCellSnippet('roles', UserRolesRenderer),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { user: row.original });
    },
  },
];
