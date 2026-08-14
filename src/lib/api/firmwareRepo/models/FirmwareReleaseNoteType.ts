export const FirmwareReleaseNoteTypes = ['breaking', 'warning', 'info', 'section'] as const;

export type FirmwareReleaseNoteType = (typeof FirmwareReleaseNoteTypes)[number];
