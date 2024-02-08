import type { ModalComponent } from "@skeletonlabs/skeleton";
import InstallDriversModal from "./InstallDriversModal.svelte";
import SignUpSuccess from "./SignUpSuccess.svelte";

export const modalRegistry: Record<string, ModalComponent> = {
  'InstallDrivers': { ref: InstallDriversModal },
  'SignUpSuccess': { ref: SignUpSuccess },
};
