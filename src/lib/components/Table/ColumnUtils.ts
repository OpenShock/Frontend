import { getReadableUserAgentName } from '$lib/utils';
import { renderComponent } from '@openshock/svelte-core/ui/data-table';
import {
  durationBetween,
  formatDuration,
  formatDurationSeconds,
  formatElapsed,
} from '@openshock/svelte-core/utils';
import {
  sortingFns,
  type BuiltInSortingFn,
  type ColumnDef,
  type Row,
  type SortingFn,
  type SortingFnOption,
  type StringOrTemplateHeader,
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

// TanStack's 'auto' sorting can't compare Temporal.Instant values (they aren't
// primitives — basic comparison invokes Temporal's valueOf, which throws), so it
// breaks sorting on every date/time column. This default adds Temporal.Instant
// support while otherwise mirroring how 'auto' resolves: numbers compare
// numerically (basic), everything else uses the alphanumeric/natural comparator.
function temporalAwareSortingFn<TData>(
  rowA: Row<TData>,
  rowB: Row<TData>,
  columnId: string
): number {
  const a: unknown = rowA.getValue(columnId);
  const b: unknown = rowB.getValue(columnId);

  // Sort nullish values last (date columns render null as "Never", numbers "N/A").
  if (a == null || b == null) {
    if (a == null && b == null) return 0;
    return a == null ? 1 : -1;
  }

  if (a instanceof Temporal.Instant && b instanceof Temporal.Instant) {
    return Temporal.Instant.compare(a, b);
  }

  // Numbers (incl. negatives like RSSI) must compare numerically, not as strings.
  if (typeof a === 'number' && typeof b === 'number') {
    return a === b ? 0 : a > b ? 1 : -1;
  }

  return sortingFns.alphanumeric(rowA, rowB, columnId);
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
    sortingFn = temporalAwareSortingFn as SortingFn<TData>;
  }

  return {
    accessorKey,
    header: CreateSortHeader(headerName),
    cell: ({ row }) => renderComponent(CellContent, renderer(row.original[accessorKey])),
    sortingFn,
  };
}

export function CreateActionsColumnDef<
  TData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches renderComponent's own constraint
  T extends Component<any>,
>(component: T, getProps: (row: TData) => ComponentProps<T>): ColumnDef<TData> {
  return {
    id: 'actions',
    cell: ({ row }) => renderComponent(component, getProps(row.original)),
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

export function LocaleDateRenderer(instant: Temporal.Instant): CellContentProps {
  return RenderCellWithTooltip(
    instant.toLocaleString(undefined, { dateStyle: 'short' }),
    instant.toString()
  );
}

export function LocaleDateTimeRenderer(instant: Temporal.Instant | null): CellContentProps {
  if (!instant) return RenderCell('Never');
  return RenderCellWithTooltip(instant.toLocaleString(), instant.toString());
}

export function TimeSinceDurationRenderer(instant: Temporal.Instant): CellContentProps {
  return RenderCellWithTooltip(
    formatDuration(durationBetween(instant, Temporal.Now.instant())),
    instant.toString()
  );
}

export function TimeSinceRelativeRenderer(instant: Temporal.Instant): CellContentProps {
  if (instant.epochMilliseconds <= 0) return CellOrangeNever;
  return RenderCellWithTooltip(
    formatElapsed(durationBetween(Temporal.Now.instant(), instant)),
    instant.toString()
  );
}

export const TimeSinceRelativeOrNeverRenderer = (
  instant: Temporal.Instant | null | undefined
): CellContentProps =>
  instant instanceof Temporal.Instant ? TimeSinceRelativeRenderer(instant) : CellOrangeNever;

export const NumberRenderer = (number: number | null): CellContentProps =>
  number ? RenderBoldCell(number.toString()) : CellNotApplicable;

// Durations are stored/transmitted in milliseconds; display them in seconds with a unit.
export const DurationRenderer = (durationMs: number | null): CellContentProps =>
  durationMs ? RenderBoldCell(formatDurationSeconds(durationMs / 1000)) : CellNotApplicable;

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
