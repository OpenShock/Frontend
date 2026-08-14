/**
 * Chip reference. `name` is the public identifier and matches esptool-js chip identifiers exactly
 * (e.g. "ESP32-S3") — pass it straight to esptool-js. The chip's UUID is server-internal.
 */
export interface FirmwareChipRef {
  name: string;
}
