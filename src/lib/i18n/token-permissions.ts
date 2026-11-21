import { m } from '#lib/paraglide/messages.js';

// The API names a permission `<category>.<action>`; both halves get a label here.
// Unknown segments fall back to the raw name, so a new permission still renders.
const CATEGORY_LABELS: Record<string, () => string> = {
  shockers: m.token_perm_category_shockers,
  devices: m.token_perm_category_devices,
  usershares: m.token_perm_category_usershares,
  publicshares: m.token_perm_category_publicshares,
};

const ACTION_LABELS: Record<string, () => string> = {
  use: m.token_perm_use,
  edit: m.token_perm_edit,
  pause: m.token_perm_pause,
  auth: m.token_perm_auth,
};

export function permissionCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category]?.() ?? category;
}

export function permissionActionLabel(action: string): string {
  return ACTION_LABELS[action]?.() ?? action;
}
