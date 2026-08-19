export const FirmwareChannels = ['stable', 'beta', 'develop'] as const;

export type FirmwareChannel = (typeof FirmwareChannels)[number];
