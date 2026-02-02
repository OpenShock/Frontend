export class ShockerPause {
  public static NONE = 0; // 0
  public static SHOCKER = 1; // 1
  public static SHARE = 1 << 1; // 2
  public static SHARE_LINK = 1 << 2; // 4
}

export function getPauseReason(pauseState: number): string | null {
  if (pauseState & ShockerPause.SHOCKER) {
    if (pauseState & ShockerPause.SHARE) return 'Shocker and User Share';
    if (pauseState & ShockerPause.SHARE_LINK) return 'Shocker and Public Share';
    return 'Shocker';
  }

  if (pauseState & ShockerPause.SHARE) return 'User Share';
  if (pauseState & ShockerPause.SHARE_LINK) return 'Public Share';
  return null;
}
