import type { ColumnDef } from '@tanstack/table-core';
import { type AdminUsersView, PasswordHashingAlgorithm, RoleType } from '$lib/api/internal/v1';
import {
  CreateSortableColumnDef,
  LocaleDateTimeRenderer,
  RenderBlueCell,
  RenderBoldCell,
  RenderCell,
  RenderOrangeCell,
} from '$lib/components/Table/ColumnUtils';
import { renderComponent } from '$lib/components/ui/data-table';
import DataTableActions from './data-table-actions.svelte';

const PasswordHashTypeRenderer = (passwordHashType: PasswordHashingAlgorithm) => {
  if (passwordHashType !== PasswordHashingAlgorithm.BCrypt)
    return RenderOrangeCell(passwordHashType);
  return RenderBoldCell(passwordHashType);
};

const UserRolesRenderer = (roles: RoleType[]) => {
  const isPrivileged = [RoleType.Admin, RoleType.System].some((role) => roles.includes(role));
  return isPrivileged ? RenderBlueCell(roles.toString()) : RenderBoldCell(roles.toString());
};

export const columns: ColumnDef<AdminUsersView>[] = [
  CreateSortableColumnDef('name', 'Name', RenderCell),
  CreateSortableColumnDef('email', 'Email', RenderCell),
  CreateSortableColumnDef('passwordHashType', 'Password hash type', PasswordHashTypeRenderer),
  CreateSortableColumnDef('roles', 'Roles', UserRolesRenderer),
  CreateSortableColumnDef('createdAt', 'Created at', LocaleDateTimeRenderer),
  CreateSortableColumnDef('activatedAt', 'Activated at', LocaleDateTimeRenderer),
  CreateSortableColumnDef('deactivatedAt', 'Deactivated at', LocaleDateTimeRenderer),
  CreateSortableColumnDef('deactivatedByUserId', 'Deactivated by', (a) => RenderCell(a ?? 'test')),
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { user: row.original });
    },
  },
];
