import type { TwColor } from "./Tailwind";

export type ValidationResult = { valid: boolean } | { valid: boolean; message: string; } | { valid: boolean; message: string; color: TwColor };

export function GetValResColor(valRes: ValidationResult): TwColor {
  if ('color' in valRes) return valRes.color;
  return valRes.valid ? 'green-500' : 'red-500';
}
