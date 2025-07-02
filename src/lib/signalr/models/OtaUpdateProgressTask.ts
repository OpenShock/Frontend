import { isNumber } from '$lib/typeguards';

export enum OtaUpdateProgressTask {
  FetchingMetadata = 0,
  PreparingForUpdate = 1,
  FlashingFilesystem = 2,
  VerifyingFilesystem = 3,
  FlashingApplication = 4,
  MarkingApplicationBootable = 5,
  Rebooting = 6,
}

export function isOtaUpdateProgressTask(value: unknown): value is OtaUpdateProgressTask {
  return (
    isNumber(value) &&
    [
      OtaUpdateProgressTask.FetchingMetadata,
      OtaUpdateProgressTask.PreparingForUpdate,
      OtaUpdateProgressTask.FlashingFilesystem,
      OtaUpdateProgressTask.VerifyingFilesystem,
      OtaUpdateProgressTask.FlashingApplication,
      OtaUpdateProgressTask.MarkingApplicationBootable,
      OtaUpdateProgressTask.Rebooting,
    ].includes(value)
  );
}
