import type { DataTableColumnMeta } from '#lib/components/Table/types.js';
import {
  columnVisibilityFeature,
  createSortedRowModel,
  metaHelper,
  rowExpandingFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
} from '@tanstack/svelte-table';

// The automation token list arrives in a single unpaged response, so sorting is
// done client-side over the whole set.
export const features = tableFeatures({
  columnVisibilityFeature,
  rowExpandingFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
  columnMeta: metaHelper<DataTableColumnMeta>(),
});

export type Features = typeof features;
