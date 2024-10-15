import type { TwColor } from "./Tailwind";

export type ValidationResult = { valid: true } | { valid: boolean; message: string; } | { valid: boolean; message: string; color: TwColor };
