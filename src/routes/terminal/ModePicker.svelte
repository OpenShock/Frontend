<script lang="ts">
  import { Settings2, Zap } from '@lucide/svelte';
  import * as Card from '$lib/components/ui/card';

  export type Mode = 'flash' | 'configure';

  interface Props {
    onSelect: (mode: Mode) => void;
  }

  let { onSelect }: Props = $props();
</script>

<div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
  <button type="button" class="text-left" onclick={() => onSelect('configure')}>
    <Card.Root class="hover:bg-accent h-full cursor-pointer transition-colors">
      <Card.Header>
        <Settings2 class="mb-2 h-8 w-8" />
        <Card.Title>Configure Device</Card.Title>
        <Card.Description>
          Configure WiFi, authentication, and more. Includes an interactive serial console.
        </Card.Description>
      </Card.Header>
    </Card.Root>
  </button>
  <button type="button" class="text-left" onclick={() => onSelect('flash')}>
    <Card.Root class="hover:bg-accent h-full cursor-pointer transition-colors">
      <Card.Header>
        <Zap class="mb-2 h-8 w-8" />
        <Card.Title>Flash Firmware</Card.Title>
        <Card.Description>Install or update firmware on a connected device.</Card.Description>
      </Card.Header>
    </Card.Root>
  </button>
</div>
