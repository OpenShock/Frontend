/** RF transmit IDs are a 16-bit value (1–65535). */
export const RfIdMin = 1;
export const RfIdMax = 65535;

/** Returns whether a value is a valid shocker RF transmit ID. */
export function isValidRfId(value: number): boolean {
  return Number.isInteger(value) && value >= RfIdMin && value <= RfIdMax;
}
