import type {
  Column,
  Column_ColumnVisibility,
  Row,
  RowData,
  Row_ColumnVisibility,
  Row_RowExpanding,
  SvelteTable,
  TableFeatures,
  Table_ColumnVisibility,
  Table_RowExpanding,
  columnVisibilityFeature,
  rowExpandingFeature,
  rowSortingFeature,
} from '@tanstack/svelte-table';

/**
 * The type of `columnDef.meta` for every table in the app.
 *
 * Declared through each feature set's `columnMeta` slot rather than by global
 * declaration merging: `@tanstack/table-core` is only a transitive dependency
 * here, so `declare module` can't resolve it.
 */
export interface DataTableColumnMeta {
  /**
   * The column's plain-text name. Sortable headers render a `SortButton`
   * instead of text, so the mobile detail row needs the name on its own to
   * label a collapsed value.
   */
  label?: string;
}

/**
 * The feature set every table in the app registers.
 *
 * `SortButton` / `DataTableTemplate` reach for APIs that v9 only adds to the
 * column, row and options types when the owning feature is present: sorting
 * (`column.toggleSorting`, `onSortingChange`), column visibility (what the
 * mobile collapse hides) and row expanding (what reveals it again).
 * Constraining on this instead of the bare `TableFeatures` states those
 * requirements up front, so a table declared without one of them fails at its
 * `<DataTable>` call site rather than at runtime.
 */
export type DataTableFeatures = TableFeatures & {
  rowSortingFeature: typeof rowSortingFeature;
  columnVisibilityFeature: typeof columnVisibilityFeature;
  rowExpandingFeature: typeof rowExpandingFeature;
  columnMeta: DataTableColumnMeta;
};

/*
 * The table, row and column types with their feature halves spelled out.
 *
 * v9 derives each half through a mapped type keyed on `keyof TFeatures`, which
 * TypeScript can't reduce while `TFeatures` is still a type parameter: a generic
 * component sees a union of "core only" or "core plus every feature" and so
 * reaches neither. Intersecting the halves actually used recovers them, which is
 * the same thing `SortButton` does for `Column_RowSorting`.
 */

export type DataTable<TFeatures extends DataTableFeatures, TData extends RowData> = SvelteTable<
  TFeatures,
  TData
> &
  Table_ColumnVisibility<TFeatures, TData> &
  Table_RowExpanding<TFeatures, TData>;

export type DataTableRow<TFeatures extends DataTableFeatures, TData extends RowData> = Row<
  TFeatures,
  TData
> &
  Row_ColumnVisibility<TFeatures, TData> &
  Row_RowExpanding;

export type DataTableColumn<TFeatures extends DataTableFeatures, TData extends RowData> = Column<
  TFeatures,
  TData,
  unknown
> &
  Column_ColumnVisibility;
