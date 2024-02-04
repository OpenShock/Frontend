import type { ModalComponent } from "@skeletonlabs/skeleton";
import InstallDriversModal from "./InstallDriversModal.svelte";

export const modalRegistry: Record<string, ModalComponent> = {
  'InstallDrivers': { ref: InstallDriversModal }
};
