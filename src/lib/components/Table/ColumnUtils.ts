import type { CellContext, ColumnDef, StringOrTemplateHeader } from '@tanstack/table-core';
import DataTableSortButton from '$lib/components/Table/SortButton.svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import { createRawSnippet } from 'svelte';
import { durationToString, elapsedToString } from '$lib/utils/time';
import type { SemVer } from 'semver';
import type { TwTextColor } from '$lib/types/Tailwind';
import { getReadableUserAgentName } from '$lib/utils/userAgent';

export function CreateSortHeader<TData>(name: string): StringOrTemplateHeader<TData, unknown> {
  return ({ column }) =>
    renderComponent(DataTableSortButton, {
      name,
      onclick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    });
}

export function CreateSimpleCellSnippet<TData extends object, K extends keyof TData & string>(
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

type TableCell =
  `<div class="px-4 font-medium${'' | ` ${TwTextColor}`}"${'' | ` title="${string}"`}>${string}</div>`;
const CellNA: TableCell = '<div class="px-4 font-medium" title="N/A">N/A</div>';
const CellOrangeNever: TableCell = '<div class="px-4 font-medium text-orange-500">Never</div>';
const CellRedUnknown: TableCell = '<div class="px-4 font-medium text-red-500">Unknown</div>';
const CellRedUnavailable: TableCell =
  '<div class="px-4 font-medium text-red-500">Unavailable</div>';

export const LocaleDateRenderer = (date: Date): TableCell =>
  `<div class="px-4 font-medium" title="${date}">${date.toLocaleDateString()}</div>`;

export const LocaleDateTimeRenderer = (date: Date): TableCell =>
  `<div class="px-4 font-medium" title="${date}">${date.toLocaleString()}</div>`;

export const TimeSinceDurationRenderer = (date: Date): TableCell =>
  `<div class="px-4 font-medium" title="${date}">${durationToString(Date.now() - date.getTime())}</div>`;

export const TimeSinceRelativeRenderer = (date: Date): TableCell =>
  `<div class="px-4 font-medium" title="${date}">${elapsedToString(date.getTime() - Date.now())}</div>`;

export const TimeSinceRelativeOrNeverRenderer = (date: Date | null | undefined): TableCell => {
  if (!date) return CellOrangeNever;
  return TimeSinceRelativeRenderer(date);
};

export const NumberRenderer = (number: number | null): TableCell =>
  number ? `<div class="px-4 font-medium" title="${number}">${number}</div>` : CellNA;

export const UserAgentRenderer = (userAgent: string | null): TableCell => {
  if (!userAgent) return CellRedUnknown;

  const readableName = getReadableUserAgentName(userAgent);
  if (!readableName)
    return `<div class="px-4 font-medium text-orange-500" title="${userAgent}">${userAgent}</div>`;

  return `<div class="px-4 font-medium" title="${userAgent}">${readableName}</div>`;
};

export const FirmwareVersionRenderer = (firmwareVersion: SemVer | null): TableCell => {
  if (!firmwareVersion) return CellRedUnavailable;

  let firmwareVersionString = firmwareVersion.toString();

  let color: TwTextColor;
  if (firmwareVersionString.length <= 0) {
    firmwareVersionString = 'Invalid';
    color = 'text-red-500';
  } else if (firmwareVersionString === '0.0.0-local') {
    color = 'text-orange-500';
  } else {
    color = 'text-white';
  }

  return `<div class="px-4 font-medium ${color}" title="${firmwareVersionString}">${firmwareVersionString}</div>`;
};
