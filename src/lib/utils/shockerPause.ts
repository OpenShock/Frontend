import { m } from '#lib/paraglide/messages.js';

export class ShockerPause {
  public static NONE = 0; // 0
  public static SHOCKER = 1; // 1
  public static SHARE = 1 << 1; // 2
  public static SHARE_LINK = 1 << 2; // 4
}

export function getPauseReason(pauseState: number): string | null {
  if (pauseState & ShockerPause.SHOCKER) {
    if (pauseState & ShockerPause.SHARE) return m.pause_reason_shocker_user_share();
    if (pauseState & ShockerPause.SHARE_LINK) return m.pause_reason_shocker_public_share();
    return m.pause_reason_shocker();
  }

  if (pauseState & ShockerPause.SHARE) return m.pause_reason_user_share();
  if (pauseState & ShockerPause.SHARE_LINK) return m.pause_reason_public_share();
  return null;
}
