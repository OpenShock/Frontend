import type { ShockerModelType } from '$lib/api';
export type Shocker = {
  id: string;
  rf_id: number;
  model: ShockerModelType;
  name: string;
  is_paused: boolean;
  created_at: Temporal.Instant;
};
export type Hub = {
  id: string;
  name: string;
  is_online: boolean;
  firmware_version: string | null;
  shockers: Shocker[];
  created_at: Temporal.Instant;
};
