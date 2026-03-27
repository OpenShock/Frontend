import type { TwTextColor } from '$lib/types/Tailwind';

export type ValidationResult = {
  valid: boolean;
  message?: string;
  color?: TwTextColor;
  link?: { text: string; href: string };
};

export function GetValResColor(valRes: ValidationResult): TwTextColor {
  if (valRes.color !== undefined) return valRes.color;
  return valRes.valid ? 'green' : 'red';
}
