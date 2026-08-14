import { FirmwareChannels, type FirmwareChannel } from '../models';

export function IsFirmwareChannel(value: string): value is FirmwareChannel {
  return (FirmwareChannels as readonly string[]).includes(value);
}
