import type { ModalComponent } from "@skeletonlabs/skeleton";
import InstallDriversModal from "./InstallDriversModal.svelte";
import SignUpSuccessModal from "./SignUpSuccessModal.svelte";
import ApiTokenGenerateModal from "./ApiTokenGenerateModal.svelte";

export const modalRegistry: Record<string, ModalComponent> = {
  'InstallDrivers': { ref: InstallDriversModal },
  'SignUpSuccess': { ref: SignUpSuccessModal },
  'ApiTokenGenerate': { ref: ApiTokenGenerateModal },
};
