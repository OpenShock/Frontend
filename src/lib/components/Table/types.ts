import type { TableFeatures, rowSortingFeature } from '@tanstack/svelte-table';

/**
 * A feature set that is guaranteed to have row sorting registered.
 *
 * Every table in the app has sortable headers, and `SortButton` /
 * `DataTableTemplate` reach for sorting APIs (`column.toggleSorting`,
 * `onSortingChange`) that v9 only adds to the column and options types when
 * `rowSortingFeature` is present. Constraining on this instead of the bare
 * `TableFeatures` states that requirement up front, so a table declared without
 * sorting fails at its `<DataTable>` call site rather than at runtime.
 */
export type SortableTableFeatures = TableFeatures & {
  rowSortingFeature: typeof rowSortingFeature;
};
