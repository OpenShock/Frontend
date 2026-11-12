<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { Settings2, Terminal, Zap } from '@lucide/svelte';
  import * as Card from '@openshock/svelte-core/components/ui/card';

  import type { Mode } from './modes';

  interface Props {
    onSelect: (mode: Mode) => void;
  }

  let { onSelect }: Props = $props();
</script>

<div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
  <button type="button" class="text-left" onclick={() => onSelect('configure')}>
    <Card.Root class="hover:bg-accent h-full cursor-pointer transition-colors">
      <Card.Header>
        <Settings2 class="mb-2 h-8 w-8" />
        <Card.Title>{m.terminal_mode_configure()}</Card.Title>
        <Card.Description>
          {m.terminal_mode_configure_desc()}
        </Card.Description>
      </Card.Header>
    </Card.Root>
  </button>
  <button type="button" class="text-left" onclick={() => onSelect('flash')}>
    <Card.Root class="hover:bg-accent h-full cursor-pointer transition-colors">
      <Card.Header>
        <Zap class="mb-2 h-8 w-8" />
        <Card.Title>{m.terminal_mode_flash()}</Card.Title>
        <Card.Description>{m.terminal_mode_flash_desc()}</Card.Description>
      </Card.Header>
    </Card.Root>
  </button>
  <button type="button" class="text-left" onclick={() => onSelect('raw')}>
    <Card.Root class="hover:bg-accent h-full cursor-pointer transition-colors">
      <Card.Header>
        <Terminal class="mb-2 h-8 w-8" />
        <Card.Title>{m.terminal_mode_raw()}</Card.Title>
        <Card.Description>{m.terminal_mode_raw_desc()}</Card.Description>
      </Card.Header>
    </Card.Root>
  </button>
</div>
