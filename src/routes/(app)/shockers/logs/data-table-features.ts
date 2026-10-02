import type { DataTableColumnMeta } from '#lib/components/Table/types.js';
import {
  columnVisibilityFeature,
  metaHelper,
  rowExpandingFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
} from '@tanstack/svelte-table';

// Logs are paged and ordered by the API (page/pageSize/sort/sortDir), so this
// table registers the sorting feature for its clickable headers but no
// sortedRowModel: the current page renders in the order the server returned it.
// The page pairs this with `manualSorting` and binds `sorting` to build the
// query.
export const features = tableFeatures({
  columnVisibilityFeature,
  rowExpandingFeature,
  rowSortingFeature,
  sortFns,
  columnMeta: metaHelper<DataTableColumnMeta>(),
});

export type Features = typeof features;
