<script lang="ts">
  import { DateFormatter, type DateValue, getLocalTimeZone } from '@internationalized/date';
  import CalendarIcon from '@lucide/svelte/icons/calendar';
  import { buttonVariants } from '$hadcn/button';
  import { Calendar } from '$hadcn/calendar';
  import * as Popover from '$hadcn/popover';
  import { cn } from '$core/utils/shadcn';

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
