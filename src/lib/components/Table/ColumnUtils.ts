import type {
  BuiltInSortingFn,
  ColumnDef,
  SortingFnOption,
  StringOrTemplateHeader,
} from '@tanstack/table-core';
import DataTableSortButton from '$lib/components/Table/SortButton.svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import { isDate } from '$lib/typeguards';
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
  const snippet = createRawSnippet<[{ value: TData[K] }]>((getValue) => ({
    render: () => renderer(getValue().value),
  }));

  return ({ row }) => renderSnippet(snippet, { value: row.original[key] });
}

type AcceptableTextColor = 'blue' | 'green' | 'orange' | 'red';
type AcceptableTextShade = 500;
export type TableCell =
  `<div class="text-xs sm:text-sm${'' | ' font-medium'}${'' | ` text-${AcceptableTextColor}-${AcceptableTextShade}`}"${'' | ` title="${string}"`}>${string}</div>`;

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

const UnsafeRenderCellWithTooltip: (content: string, tooltip: string) => TableCell = (
  content,
  tooltip
) => `<div class="text-xs sm:text-sm font-medium" title="${tooltip}">${content}</div>`;
const UnsafeRenderColoredCell: (content: string, color: AcceptableTextColor) => TableCell = (
  content,
  color
) => `<div class="text-xs sm:text-sm font-medium text-${color}-500">${content}</div>`;

export const CellNotApplicable = UnsafeRenderCellWithTooltip('N/A', 'Not applicable');
export const CellOrangeNever = UnsafeRenderColoredCell('Never', 'orange');
export const CellRedUnknown = UnsafeRenderColoredCell('Unknown', 'red');
export const CellRedInvalid = UnsafeRenderColoredCell('Invalid', 'red');
export const CellRedUnavailable = UnsafeRenderColoredCell('Unavailable', 'red');
export const CellRedNone = UnsafeRenderColoredCell('None', 'red');
export const CellGreenTrue = UnsafeRenderColoredCell('true', 'green');
export const CellRedFalse = UnsafeRenderColoredCell('false', 'red');
export const CellGreenOnline = UnsafeRenderColoredCell('online', 'green');
export const CellRedOffline = UnsafeRenderColoredCell('offline', 'red');

export const RenderCell = (content: string): TableCell =>
  `<div class="text-xs sm:text-sm">${escapeHtml(content)}</div>`;
export const RenderBoldCell = (content: string): TableCell =>
  `<div class="text-xs sm:text-sm font-medium">${escapeHtml(content)}</div>`;
export const RenderRedCell = (content: string): TableCell =>
  UnsafeRenderColoredCell(escapeHtml(content), 'red');
export const RenderGreenCell = (content: string): TableCell =>
  UnsafeRenderColoredCell(escapeHtml(content), 'green');
export const RenderOrangeCell = (content: string): TableCell =>
  UnsafeRenderColoredCell(escapeHtml(content), 'orange');
export const RenderBlueCell = (content: string): TableCell =>
  UnsafeRenderColoredCell(escapeHtml(content), 'blue');
export const RenderCellWithTooltip = (content: string, tooltip: string): TableCell =>
  UnsafeRenderCellWithTooltip(escapeHtml(content), escapeHtml(tooltip));

export const LocaleDateRenderer = (date: Date): TableCell =>
  RenderCellWithTooltip(date.toLocaleDateString(), date.toString());

export const LocaleDateTimeRenderer = (date: Date | null): TableCell =>
  date ? RenderCellWithTooltip(date.toLocaleString(), date.toString()) : RenderCell('Never');

export const TimeSinceDurationRenderer = (date: Date): TableCell =>
  RenderCellWithTooltip(durationToString(Date.now() - date.getTime()), date.toString());

export const TimeSinceRelativeRenderer = (date: Date): TableCell =>
  date.getTime() > 0
    ? RenderCellWithTooltip(elapsedToString(date.getTime() - Date.now()), date.toString())
    : CellOrangeNever;

export const TimeSinceRelativeOrNeverRenderer = (date: Date | null | undefined): TableCell =>
  isDate(date) ? TimeSinceRelativeRenderer(date) : CellOrangeNever; // The isDate check is a workaround, for some reason if the input data is undefined, it will be transformed to a empty object and throws an error when trying to access getTime().

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
