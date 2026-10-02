import { type AutomationTokenDto, AutomationTokenType } from '#lib/api/index.js';
import {
  CellNotApplicable,
  CellRedNone,
  CreateColumnDefs,
  LocaleDateTimeRenderer,
  RenderBlueCell,
  RenderBoldCell,
  RenderCell,
  RenderOrangeCell,
  TimeSinceRelativeOrNeverRenderer,
} from '#lib/components/Table/ColumnUtils.js';
import { formatTimeSpan } from '#lib/utils/index.js';
import DataTableActions from './data-table-actions.svelte';
import type { Features } from './data-table-features';

/** Whether accounts a token created are deleted, and how long after creation. */
export interface AutoCleanupPolicy {
  enabled: boolean;
  /** Null when cleanup is off, or on with no interval set — which says nothing about when accounts expire. */
  after: string | null;
}

/**
 * A token plus its cleanup policy as one value. A column renderer only receives
 * its own accessor's value, and the policy reads two response fields.
 */
export type AutomationToken = AutomationTokenDto & { autoCleanup: AutoCleanupPolicy };

export function toAutomationToken(token: AutomationTokenDto): AutomationToken {
  const enabled = token.autoCleanupUsers ?? false;
  return {
    ...token,
    autoCleanup: { enabled, after: enabled ? (token.autoCleanupAfter ?? null) : null },
  };
}

/** Every protection a token can be granted the right to switch off. */
export const automationTokenTypes = Object.values(AutomationTokenType);

const automationTokenTypeLabels: Record<AutomationTokenType, string> = {
  [AutomationTokenType.Turnstile]: 'Turnstile',
  [AutomationTokenType.RateLimit]: 'Rate limit',
};

export function formatTokenType(type: AutomationTokenType): string {
  return automationTokenTypeLabels[type] ?? type;
}

export function formatTokenTypes(types: AutomationTokenType[]): string {
  return types.map(formatTokenType).join(', ');
}

const { CreateSortableColumnDef, CreateActionsColumnDef } = CreateColumnDefs<
  Features,
  AutomationToken
>();

// Each type switches a protection off, so the set a token carries is the thing
// to notice first in the row.
function TokenTypesRenderer(types: AutomationTokenType[]) {
  if (types.length === 0) return CellRedNone;
  return RenderBlueCell(formatTokenTypes(types));
}

// Counted, so zero is a real value; only an absent count is "N/A".
function UseCountRenderer(useCount: bigint | undefined) {
  if (useCount === undefined) return CellNotApplicable;
  return RenderBoldCell(useCount.toLocaleString());
}

function AutoCleanupRenderer({ enabled, after }: AutoCleanupPolicy) {
  if (!enabled) return RenderCell('Off');
  if (after === null) return RenderOrangeCell('On, no interval');
  return RenderBoldCell(`After ${formatTimeSpan(after)}`);
}

// Off < on-but-unconfigured < on with an interval, so the misconfigured ones
// sort next to the policies they are closest to being.
function autoCleanupRank({ enabled, after }: AutoCleanupPolicy): number {
  if (!enabled) return 0;
  return after === null ? 1 : 2;
}

const dataColumns = [
  CreateSortableColumnDef('name', 'Name', RenderBoldCell),
  CreateSortableColumnDef('types', 'Bypasses', TokenTypesRenderer, (a, b) =>
    formatTokenTypes(a).localeCompare(formatTokenTypes(b))
  ),
  // bigint is neither a number nor a Temporal.Instant, so the default
  // comparator would fall through to the alphanumeric one and order these as
  // strings ("10" before "9").
  CreateSortableColumnDef('useCount', 'Uses', UseCountRenderer, (a, b) => {
    const left = a ?? 0n;
    const right = b ?? 0n;
    return left === right ? 0 : left < right ? -1 : 1;
  }),
  CreateSortableColumnDef('lastUsedAt', 'Last used', TimeSinceRelativeOrNeverRenderer),
  CreateSortableColumnDef('lastRotatedAt', 'Last rotated', TimeSinceRelativeOrNeverRenderer),
  CreateSortableColumnDef(
    'autoCleanup',
    'Account cleanup',
    AutoCleanupRenderer,
    (a, b) => autoCleanupRank(a) - autoCleanupRank(b)
  ),
  CreateSortableColumnDef('createdAt', 'Created at', LocaleDateTimeRenderer),
];

/** `onChange` re-fetches the list after a row action mutated a token. */
export function createColumns(onChange: () => void) {
  return [
    ...dataColumns,
    CreateActionsColumnDef(DataTableActions, (token) => ({ token, onChange })),
  ];
}
