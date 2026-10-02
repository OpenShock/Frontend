<script lang="ts">
  import { Check, CirclePlus } from '@lucide/svelte';
  import { Badge } from '@openshock/svelte-core/components/ui/badge';
  import { buttonVariants } from '@openshock/svelte-core/components/ui/button';
  import * as Command from '@openshock/svelte-core/components/ui/command';
  import * as Popover from '@openshock/svelte-core/components/ui/popover';
  import { Separator } from '@openshock/svelte-core/components/ui/separator';
  import { cn } from '@openshock/svelte-core/utils';
  import type { DistributionBucket } from './distribution-chart.svelte';

  interface Props {
    title: string;
    buckets: DistributionBucket[];
    selected: string[];
    onChange: (selected: string[]) => void;
  }

  let { title, buckets, selected, onChange }: Props = $props();

  // Past this many picks the trigger shows a count rather than every label.
  const MAX_BADGES = 2;

  let selectedBuckets = $derived(buckets.filter((b) => b.key !== null && selected.includes(b.key)));

  function toggle(key: string) {
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  }
</script>

<Popover.Root>
  <Popover.Trigger
    class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-8 border-dashed')}
  >
    <CirclePlus />
    {title}
    {#if selected.length > 0}
      <Separator orientation="vertical" class="mx-0.5 h-4" />
      {#if selected.length > MAX_BADGES}
        <Badge variant="secondary" class="rounded-sm px-1 font-normal">
          {selected.length} selected
        </Badge>
      {:else}
        {#each selectedBuckets as bucket (bucket.key)}
          <Badge variant="secondary" class="max-w-32 truncate rounded-sm px-1 font-normal">
            {bucket.name}
          </Badge>
        {/each}
      {/if}
    {/if}
  </Popover.Trigger>
  <Popover.Content class="w-64 p-0" align="start">
    <Command.Root>
      <Command.Input placeholder={title} />
      <Command.List>
        <Command.Empty>No results.</Command.Empty>
        <Command.Group>
          {#each buckets as bucket (bucket.key)}
            {#if bucket.key !== null}
              {@const key = bucket.key}
              {@const isSelected = selected.includes(key)}
              <Command.Item value="{bucket.name} {key}" onSelect={() => toggle(key)}>
                <div
                  class={cn(
                    'border-primary flex size-4 items-center justify-center rounded-sm border',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'opacity-50 [&_svg]:invisible'
                  )}
                >
                  <Check class="size-3.5" />
                </div>
                <span class="truncate">{bucket.name}</span>
                <Command.Shortcut class="tabular-nums">{bucket.count}</Command.Shortcut>
              </Command.Item>
            {/if}
          {/each}
        </Command.Group>
        {#if selected.length > 0}
          <Command.Separator />
          <Command.Group>
            <Command.Item class="justify-center text-center" onSelect={() => onChange([])}>
              Clear filter
            </Command.Item>
          </Command.Group>
        {/if}
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
