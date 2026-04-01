import { renderComponent } from '$lib/components/ui/data-table';
import { isDate } from '$lib/typeguards';
import { durationToString, elapsedToString, getReadableUserAgentName } from '$lib/utils';
import type {
  BuiltInSortingFn,
  ColumnDef,
  SortingFnOption,
  StringOrTemplateHeader,
} from '@tanstack/table-core';
import type { SemVer } from 'semver';
import type { Component, ComponentProps } from 'svelte';
import CellContent from './CellContent.svelte';
import DataTableSortButton from './SortButton.svelte';

type CellContentProps = ComponentProps<typeof CellContent>;

function CreateSortHeader<TData>(name: string): StringOrTemplateHeader<TData, unknown> {
  return ({ column }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic Svelte components can't be parameterized in .ts files
    renderComponent(DataTableSortButton as Component<any>, {
      name,
      column,
    });
}

export function CreateColumnDef<TData extends object, TKey extends Extract<keyof TData, string>>(
  accessorKey: TKey,
  headerName: string,
  renderer: (content: TData[TKey]) => CellContentProps
): ColumnDef<TData> {
  return {
    accessorKey,
    header: headerName,
    cell: ({ row }) => renderComponent(CellContent, renderer(row.original[accessorKey])),
  };
}

export function CreateSortableColumnDef<
  TData extends object,
  TKey extends Extract<keyof TData, string>,
>(
  accessorKey: TKey,
  headerName: string,
  renderer: (content: TData[TKey]) => CellContentProps,
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
    cell: ({ row }) => renderComponent(CellContent, renderer(row.original[accessorKey])),
    sortingFn,
  };
}

// Pre-defined cell values
export const CellNotApplicable: CellContentProps = {
  text: 'N/A',
  bold: true,
  title: 'Not applicable',
};
export const CellOrangeNever: CellContentProps = { text: 'Never', bold: true, color: 'orange' };
export const CellRedUnknown: CellContentProps = { text: 'Unknown', bold: true, color: 'red' };
export const CellRedInvalid: CellContentProps = { text: 'Invalid', bold: true, color: 'red' };
export const CellRedUnavailable: CellContentProps = {
  text: 'Unavailable',
  bold: true,
  color: 'red',
};
export const CellRedNone: CellContentProps = { text: 'None', bold: true, color: 'red' };
export const CellGreenTrue: CellContentProps = { text: 'true', bold: true, color: 'green' };
export const CellRedFalse: CellContentProps = { text: 'false', bold: true, color: 'red' };
export const CellGreenOnline: CellContentProps = { text: 'online', bold: true, color: 'green' };
export const CellRedOffline: CellContentProps = { text: 'offline', bold: true, color: 'red' };

// Cell renderers
export const RenderCell = (content: string): CellContentProps => ({ text: content });

export const RenderBoldCell = (content: string): CellContentProps => ({
  text: content,
  bold: true,
});

export const RenderRedCell = (content: string): CellContentProps => ({
  text: content,
  bold: true,
  color: 'red',
});

export const RenderGreenCell = (content: string): CellContentProps => ({
  text: content,
  bold: true,
  color: 'green',
});

export const RenderOrangeCell = (content: string): CellContentProps => ({
  text: content,
  bold: true,
  color: 'orange',
});

export const RenderBlueCell = (content: string): CellContentProps => ({
  text: content,
  bold: true,
  color: 'blue',
});

export const RenderCellWithTooltip = (content: string, tooltip: string): CellContentProps => ({
  text: content,
  bold: true,
  title: tooltip,
});

export const LocaleDateRenderer = (date: Date): CellContentProps =>
  RenderCellWithTooltip(date.toLocaleDateString(), date.toString());

export const LocaleDateTimeRenderer = (date: Date | null): CellContentProps =>
  date ? RenderCellWithTooltip(date.toLocaleString(), date.toString()) : RenderCell('Never');

export const TimeSinceDurationRenderer = (date: Date): CellContentProps =>
  RenderCellWithTooltip(durationToString(Date.now() - date.getTime()), date.toString());

export const TimeSinceRelativeRenderer = (date: Date): CellContentProps =>
  date.getTime() > 0
    ? RenderCellWithTooltip(elapsedToString(date.getTime() - Date.now()), date.toString())
    : CellOrangeNever;

export const TimeSinceRelativeOrNeverRenderer = (
  date: Date | null | undefined
): CellContentProps => (isDate(date) ? TimeSinceRelativeRenderer(date) : CellOrangeNever); // The isDate check is a workaround, for some reason if the input data is undefined, it will be transformed to a empty object and throws an error when trying to access getTime().

export const NumberRenderer = (number: number | null): CellContentProps =>
  number ? RenderBoldCell(number.toString()) : CellNotApplicable;

export const UserAgentRenderer = (userAgent: string | null): CellContentProps => {
  if (!userAgent) return CellRedUnknown;

  const readableName = getReadableUserAgentName(userAgent);
  if (!readableName) return RenderOrangeCell(userAgent);

  return RenderCellWithTooltip(readableName, userAgent);
};

export const FirmwareVersionRenderer = (
  firmwareVersion: SemVer | string | null
): CellContentProps => {
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
