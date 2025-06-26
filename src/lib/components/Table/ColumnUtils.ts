import type {
  BuiltInSortingFn,
  CellContext,
  ColumnDef,
  SortingFnOption,
  StringOrTemplateHeader,
} from '@tanstack/table-core';
import DataTableSortButton from '$lib/components/Table/SortButton.svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import type { TwTextColor } from '$lib/types/Tailwind';
import {
  durationToString,
  elapsedToString,
  escapeHtml,
  getReadableUserAgentName,
} from '$lib/utils';
import { type SemVer } from 'semver';
import { createRawSnippet } from 'svelte';

function CreateSortHeader<TData>(name: string): StringOrTemplateHeader<TData, unknown> {
  return ({ column }) =>
    renderComponent(DataTableSortButton<TData>, {
      name,
      column,
    });
}

function CreateSimpleCellSnippet<TData extends object, K extends keyof TData & string>(
  key: K,
  renderer: (value: TData[K]) => string
): ColumnDef<TData, unknown>['cell'] {
  return ({ row }: CellContext<TData, unknown>) => {
    const value = row.getValue(key) as TData[K];

    return renderSnippet(
      createRawSnippet<[TData[K]]>((getValue) => ({
        render: () => renderer(getValue()),
      })),
      value
    );
  };
}

export type TableCell =
  `<div class="px-4${'' | ' font-medium'}${'' | ` ${TwTextColor}`}"${'' | ` title="${string}"`}>${string}</div>`;

export function CreateColumnDef<TData extends object, TKey extends Extract<keyof TData, string>>(
  accessorKey: TKey,
  headerName: string,
  renderer: (content: TData[TKey]) => TableCell
): ColumnDef<TData> {
  return {
    accessorKey,
    header: headerName,
    cell: CreateSimpleCellSnippet(accessorKey, renderer),
  };
}
export function CreateSortableColumnDef<
  TData extends object,
  TKey extends Extract<keyof TData, string>,
>(
  accessorKey: TKey,
  headerName: string,
  renderer: (content: TData[TKey]) => TableCell,
  sortFunct?: 'auto' | ((a: TData[TKey], b: TData[TKey]) => number) | BuiltInSortingFn
): ColumnDef<TData> {
  let sortingFn: SortingFnOption<TData>;
  if (sortFunct) {
    if (typeof sortFunct === 'string') {
      sortingFn = sortFunct;
    } else {
      sortingFn = (row_a, row_b) =>
        sortFunct(row_a.getValue(accessorKey), row_b.getValue(accessorKey));
    }
  } else {
    sortingFn = 'auto';
  }

  return {
    accessorKey,
    header: CreateSortHeader(headerName),
    cell: CreateSimpleCellSnippet(accessorKey, renderer),
    sortingFn,
  };
}

export const CellNotApplicable =
  '<div class="px-4 font-medium" title="N/A">N/A</div>' as const satisfies TableCell;
export const CellOrangeNever =
  '<div class="px-4 font-medium text-orange-500">Never</div>' as const satisfies TableCell;
export const CellRedUnknown =
  '<div class="px-4 font-medium text-red-500">Unknown</div>' as const satisfies TableCell;
export const CellRedInvalid =
  '<div class="px-4 font-medium text-red-500">Invalid</div>' as const satisfies TableCell;
export const CellRedUnavailable =
  '<div class="px-4 font-medium text-red-500">Unavailable</div>' as const satisfies TableCell;
export const CellGreenTrue =
  '<div class="px-4 font-medium text-green-500">true</div>' as const satisfies TableCell;
export const CellRedFalse =
  '<div class="px-4 font-medium text-red-500">false</div>' as const satisfies TableCell;
export const CellGreenOnline =
  '<div class="px-4 font-medium text-green-500">online</div>' as const satisfies TableCell;
export const CellRedOffline =
  '<div class="px-4 font-medium text-red-500">offline</div>' as const satisfies TableCell;

export const RenderCell = (content: string): TableCell =>
  `<div class="px-4">${escapeHtml(content)}</div>`;
export const RenderBoldCell = (content: string): TableCell =>
  `<div class="px-4 font-medium">${escapeHtml(content)}</div>`;
export const RenderRedCell = (content: string): TableCell =>
  `<div class="px-4 font-medium text-red-500">${escapeHtml(content)}</div>`;
export const RenderGreenCell = (content: string): TableCell =>
  `<div class="px-4 font-medium text-green-500">${escapeHtml(content)}</div>`;
export const RenderOrangeCell = (content: string): TableCell =>
  `<div class="px-4 font-medium text-orange-500">${escapeHtml(content)}</div>`;
export const RenderBlueCell = (content: string): TableCell =>
  `<div class="px-4 font-medium text-blue-500">${escapeHtml(content)}</div>`;
export const RenderCellWithTooltip = (content: string, tooltip: string): TableCell =>
  `<div class="px-4 font-medium" title="${escapeHtml(tooltip)}">${escapeHtml(content)}</div>`;

export const LocaleDateRenderer = (date: Date): TableCell =>
  RenderCellWithTooltip(date.toLocaleDateString(), date.toString());

export const LocaleDateTimeRenderer = (date: Date | null): TableCell =>
  date ? RenderCellWithTooltip(date.toLocaleString(), date.toString()) : RenderCell('Never');

export const TimeSinceDurationRenderer = (date: Date): TableCell =>
  RenderCellWithTooltip(durationToString(Date.now() - date.getTime()), date.toString());

export const TimeSinceRelativeRenderer = (date: Date): TableCell =>
  RenderCellWithTooltip(elapsedToString(date.getTime() - Date.now()), date.toString());

export const TimeSinceRelativeOrNeverRenderer = (date: Date | null | undefined): TableCell =>
  date ? (date.getTime() > 0 ? TimeSinceRelativeRenderer(date) : CellOrangeNever) : CellOrangeNever;

export const NumberRenderer = (number: number | null): TableCell =>
  number ? RenderBoldCell(number.toString()) : CellNotApplicable;

export const UserAgentRenderer = (userAgent: string | null): TableCell => {
  if (!userAgent) return CellRedUnknown;

  const readableName = getReadableUserAgentName(userAgent);
  if (!readableName) return RenderOrangeCell(userAgent);

  return RenderCellWithTooltip(readableName, userAgent);
};

export const FirmwareVersionRenderer = (firmwareVersion: SemVer | string | null): TableCell => {
  if (!firmwareVersion) return CellRedUnavailable;

  if (typeof firmwareVersion !== 'string') {
    firmwareVersion = firmwareVersion.toString();
  }

  if (firmwareVersion.length <= 0) {
    return CellRedInvalid;
  } else if (firmwareVersion === '0.0.0-local') {
    return RenderOrangeCell(firmwareVersion);
  }

  return RenderBoldCell(firmwareVersion);
};
