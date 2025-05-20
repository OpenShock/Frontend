import type { CellContext, ColumnDef, StringOrTemplateHeader } from '@tanstack/table-core';
import DataTableSortButton from '$lib/components/Table/SortButton.svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import { createRawSnippet } from 'svelte';
import { durationToString, elapsedToString } from '$lib/utils/time';
import type { SemVer } from 'semver';
import type { TwTextColor } from '$lib/types/Tailwind';
import { getReadableUserAgentName } from '$lib/utils/userAgent';
import { escapeHtml } from '$lib/utils/encoding';

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

export type TableCell =
  `<div class="px-4 font-medium${'' | ` ${TwTextColor}`}"${'' | ` title="${string}"`}>${string}</div>`;
export const CellNotApplicable =
  '<div class="px-4 font-medium" title="N/A">N/A</div>' as const satisfies TableCell;
export const CellOrangeNever =
  '<div class="px-4 font-medium text-orange-500">Never</div>' as const satisfies TableCell;
export const CellRedUnknown =
  '<div class="px-4 font-medium text-red-500">Unknown</div>' as const satisfies TableCell;
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

export const LocaleDateTimeRenderer = (date: Date): TableCell =>
  RenderCellWithTooltip(date.toLocaleString(), date.toString());

export const TimeSinceDurationRenderer = (date: Date): TableCell =>
  RenderCellWithTooltip(durationToString(Date.now() - date.getTime()), date.toString());

export const TimeSinceRelativeRenderer = (date: Date): TableCell =>
  RenderCellWithTooltip(elapsedToString(date.getTime() - Date.now()), date.toString());

export const TimeSinceRelativeOrNeverRenderer = (date: Date | null | undefined): TableCell =>
  date ? TimeSinceRelativeRenderer(date) : CellOrangeNever;

export const NumberRenderer = (number: number | null): TableCell =>
  number ? RenderCell(number.toString()) : CellNotApplicable;

export const UserAgentRenderer = (userAgent: string | null): TableCell => {
  if (!userAgent) return CellRedUnknown;

  const readableName = getReadableUserAgentName(userAgent);
  if (!readableName) return RenderOrangeCell(userAgent);

  return RenderCellWithTooltip(readableName, userAgent);
};

export const FirmwareVersionRenderer = (firmwareVersion: SemVer | null): TableCell => {
  if (!firmwareVersion) return CellRedUnavailable;

  let firmwareVersionString = firmwareVersion.toString();

  if (firmwareVersionString.length <= 0) {
    return RenderRedCell('Invalid');
  } else if (firmwareVersionString === '0.0.0-local') {
    return RenderOrangeCell(firmwareVersionString);
  }

  return RenderCell(firmwareVersionString);
};
