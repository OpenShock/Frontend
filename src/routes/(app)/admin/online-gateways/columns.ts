import type { AdminOnlineGatewayResponse } from '#lib/api/index.js';
import {
  CellNotApplicable,
  CellRedUnknown,
  CreateColumnDefs,
  RenderBoldCell,
  RenderCell,
  RenderCellWithTooltip,
  RenderGreenCell,
  RenderOrangeCell,
  RenderRedCell,
} from '#lib/components/Table/ColumnUtils.js';
import { countryName } from '#lib/utils/index.js';
import DataTableActions from './data-table-actions.svelte';
import type { Features } from './data-table-features';

/**
 * A gateway plus the two fields the table shows as one cell each. A column
 * renderer only receives its own accessor's value, so anything combining
 * several response fields is folded in here.
 */
export type OnlineGateway = AdminOnlineGatewayResponse & {
  /** `host:port` plus path prefix — what a hub actually connects to. */
  endpoint: string;
  /** `lat, long`, or null when the gateway reports no position. */
  coordinates: string | null;
};

export function toOnlineGateway(gateway: AdminOnlineGatewayResponse): OnlineGateway {
  const { host, port, pathPrefix, latitude, longitude } = gateway;

  return {
    ...gateway,
    endpoint: `${host}:${port}${pathPrefix}`,
    coordinates:
      latitude === null || longitude === null
        ? null
        : `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
  };
}

/** Load the gateway advertises, in percent, above which it is nearly full. */
export const HIGH_LOAD_PERCENT = 80;

/** Load in percent above which a gateway is no longer comfortably idle. */
export const ELEVATED_LOAD_PERCENT = 50;

const PRODUCTION_ENVIRONMENT = 'production';

const { CreateSortableColumnDef, CreateActionsColumnDef } = CreateColumnDefs<
  Features,
  OnlineGateway
>();

function LoadRenderer(load: number) {
  const text = `${load}%`;
  if (load >= HIGH_LOAD_PERCENT) return RenderRedCell(text);
  if (load >= ELEVATED_LOAD_PERCENT) return RenderOrangeCell(text);
  return RenderGreenCell(text);
}

function CountryRenderer(code: string) {
  const name = countryName(code);
  return name ? RenderCellWithTooltip(name, code) : CellRedUnknown;
}

// A gateway running anything but production alongside the production fleet is
// worth noticing, so it is called out rather than rendered as plain text.
function EnvironmentRenderer(environment: string) {
  if (!environment) return CellRedUnknown;
  return environment.toLowerCase() === PRODUCTION_ENVIRONMENT
    ? RenderCell(environment)
    : RenderOrangeCell(environment);
}

export const columns = [
  CreateSortableColumnDef('id', 'Gateway', RenderBoldCell),
  CreateSortableColumnDef('endpoint', 'Endpoint', RenderCell),
  CreateSortableColumnDef('country', 'Country', CountryRenderer, (a, b) => {
    const nameA = countryName(a);
    const nameB = countryName(b);
    if (nameA === null || nameB === null) return nameA === nameB ? 0 : nameA === null ? 1 : -1;
    return nameA.localeCompare(nameB);
  }),
  CreateSortableColumnDef('environment', 'Environment', EnvironmentRenderer),
  CreateSortableColumnDef('load', 'Load', LoadRenderer),
  // Counted, so zero is a real value and must not render as "N/A".
  CreateSortableColumnDef('connectedHubs', 'Hubs', (count) => RenderBoldCell(count.toString())),
  CreateSortableColumnDef('coordinates', 'Coordinates', (coordinates) =>
    coordinates ? RenderCell(coordinates) : CellNotApplicable
  ),
  CreateActionsColumnDef(DataTableActions, (gateway) => ({ gateway })),
];
