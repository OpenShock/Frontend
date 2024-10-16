import type { TwColor } from "./Tailwind";

export type ValidationResult = { valid: boolean, message?: string; color?: TwColor, link?: { text: string, href: string } };

export function GetValResColor(valRes: ValidationResult): TwColor {
  if (valRes.color !== undefined) return valRes.color;
  return valRes.valid ? 'green-500' : 'red-500';
}
