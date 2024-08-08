import type { ModalComponent } from "@skeletonlabs/skeleton";
import InstallDriversModal from "./InstallDriversModal.svelte";
import SignUpSuccessModal from "./SignUpSuccessModal.svelte";
import ApiTokenGenerateModal from "./ApiTokenGenerateModal.svelte";
import ApiTokenEditModal from "./ApiTokenEditModal.svelte";
import ApiTokenDisplayGeneratedModal from "./ApiTokenDisplayGeneratedModal.svelte";

export const modalRegistry: Record<string, ModalComponent> = {
  'InstallDrivers': { ref: InstallDriversModal },
  'SignUpSuccess': { ref: SignUpSuccessModal },
  'ApiTokenGenerate': { ref: ApiTokenGenerateModal },
  'ApiTokenEdit': { ref: ApiTokenEditModal },
  'ApiTokenDisplayGenerated': { ref: ApiTokenDisplayGeneratedModal },
};
