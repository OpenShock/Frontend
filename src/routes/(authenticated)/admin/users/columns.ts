import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table';
import { PasswordHashingAlgorithm, RoleType, type AdminUsersView } from '$lib/api/internal/v1';
import DataTableActions from './data-table-actions.svelte';
import {
  CellGreenTrue,
  CellRedFalse,
  CreateSortableColumnDef,
  LocaleDateTimeRenderer,
  RenderBlueCell,
  RenderBoldCell,
  RenderCell,
  RenderOrangeCell,
} from '$lib/components/Table/ColumnUtils';

const PasswordHashTypeRenderer = (passwordHashType: PasswordHashingAlgorithm) => {
  if (passwordHashType !== PasswordHashingAlgorithm.BCrypt)
    return RenderOrangeCell(passwordHashType);
  return RenderBoldCell(passwordHashType);
};

const IsEmailActivatedRenderer = (emailActivated: boolean) =>
  emailActivated ? CellGreenTrue : CellRedFalse;
const UserRolesRenderer = (roles: RoleType[]) => {
  const isPrivileged = [RoleType.Admin, RoleType.System].some((role) => roles.includes(role));
  return isPrivileged ? RenderBlueCell(roles.toString()) : RenderBoldCell(roles.toString());
};

export const columns: ColumnDef<AdminUsersView>[] = [
  CreateSortableColumnDef('name', 'Name', RenderCell),
  CreateSortableColumnDef('email', 'Email', RenderCell),
  CreateSortableColumnDef('passwordHashType', 'Password hash type', PasswordHashTypeRenderer),
  CreateSortableColumnDef('createdAt', 'Created at', LocaleDateTimeRenderer),
  CreateSortableColumnDef('emailActivated', 'Email activated', IsEmailActivatedRenderer),
  CreateSortableColumnDef('roles', 'Roles', UserRolesRenderer),
  {
    id: 'actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { user: row.original });
    },
  },
];
