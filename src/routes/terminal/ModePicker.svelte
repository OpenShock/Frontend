<script lang="ts">
  import { Terminal, Zap } from '@lucide/svelte';
  import * as Card from '$lib/components/ui/card';

  export type Mode = 'terminal' | 'flash';

  interface Props {
    onSelect: (mode: Mode) => void;
  }

  let { onSelect }: Props = $props();
</script>

<div class="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
  <button type="button" class="text-left" onclick={() => onSelect('terminal')}>
    <Card.Root class="hover:bg-accent h-full cursor-pointer transition-colors">
      <Card.Header>
        <Terminal class="mb-2 h-8 w-8" />
        <Card.Title>Open Terminal</Card.Title>
        <Card.Description>View device logs and send commands.</Card.Description>
      </Card.Header>
    </Card.Root>
  </button>
  <button type="button" class="text-left" onclick={() => onSelect('flash')}>
    <Card.Root class="hover:bg-accent h-full cursor-pointer transition-colors">
      <Card.Header>
        <Zap class="mb-2 h-8 w-8" />
        <Card.Title>Flash Firmware</Card.Title>
        <Card.Description>Install or update firmware.</Card.Description>
      </Card.Header>
    </Card.Root>
  </button>
</div>
