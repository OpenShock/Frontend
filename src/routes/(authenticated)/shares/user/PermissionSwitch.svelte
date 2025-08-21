<script lang="ts">
  import { Switch } from "$lib/components/ui/switch";
  import type { IconProps } from "@lucide/svelte";


    import type { Component } from "svelte";

    interface Props {
        icon: Component<IconProps, {}, "">
        enabled: boolean
    }

    let { icon: Icon, enabled = $bindable() }: Props = $props();

</script>

<div class="border-1 border-neutral-800 rounded-lg p-4 w-30 h-30 flex flex-col gap-4 items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors duration-300" 
    onclick={() => (enabled = !enabled)}>
    <Icon size="100%" />
    <Switch checked={enabled} />
</div>