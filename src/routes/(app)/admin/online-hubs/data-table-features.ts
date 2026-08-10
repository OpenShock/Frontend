import {
  createSortedRowModel,
  rowSortingFeature,
  sortFns,
  tableFeatures,
} from '@tanstack/svelte-table';

// Every online hub is returned in one response, so sorting is done client-side
// over the whole set.
export const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
});

export type Features = typeof features;
