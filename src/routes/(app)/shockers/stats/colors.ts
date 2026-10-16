import type { StatControlType } from '#lib/utils/controlStats.js';

export const controlTypeColors: Record<StatControlType, { light: string; dark: string }> = {
  Shock: { light: '#eb6834', dark: '#d95926' },
  Vibrate: { light: '#2a78d6', dark: '#3987e5' },
  Sound: { light: '#a9489f', dark: '#bf5ab8' },
};

export const controlTypeLabels: Record<StatControlType, string> = {
  Shock: 'Shocks',
  Vibrate: 'Vibrations',
  Sound: 'Sounds',
};
