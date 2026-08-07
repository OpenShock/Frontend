import { rowSortingFeature, sortFns, tableFeatures } from '@tanstack/svelte-table';

// Users are paged and ordered by the API ($offset/$limit/$orderby), so this
// table registers the sorting feature for its clickable headers but no
// sortedRowModel: the current page renders in the order the server returned it.
// The page pairs this with `manualSorting` and binds `sorting` to build
// $orderby.
export const features = tableFeatures({
  rowSortingFeature,
  sortFns,
});

export type Features = typeof features;
