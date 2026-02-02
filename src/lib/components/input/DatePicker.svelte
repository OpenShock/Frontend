<script lang="ts">
  import { DateFormatter, type DateValue, getLocalTimeZone } from '@internationalized/date';
  import CalendarIcon from '@lucide/svelte/icons/calendar';
  import { buttonVariants } from '$lib/components/ui/button/index.js';
  import { Calendar } from '$lib/components/ui/calendar/index.js';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import { cn } from '$lib/utils/shadcn';

  interface Props {
    value: DateValue | undefined;
  }

  let { value = $bindable() }: Props = $props();

  const df = new DateFormatter('en-US', {
    dateStyle: 'long',
  });

  let contentRef = $state<HTMLElement | null>(null);
</script>

<Popover.Root>
  <Popover.Trigger
    class={cn(
      buttonVariants({
        variant: 'outline',
        class: ' justify-start text-left font-normal',
      }),
      !value && 'text-muted-foreground'
    )}
  >
    <CalendarIcon />
    {value ? df.format(value.toDate(getLocalTimeZone())) : 'Pick a date'}
  </Popover.Trigger>
  <Popover.Content bind:ref={contentRef} class="w-auto p-0">
    <Calendar type="single" bind:value />
  </Popover.Content>
</Popover.Root>
