<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { intlLocale } from '#lib/i18n/intl.js';
  import { DateFormatter, type DateValue, getLocalTimeZone } from '@internationalized/date';
  import CalendarIcon from '@lucide/svelte/icons/calendar';
  import { buttonVariants } from '@openshock/svelte-core/components/ui/button';
  import { Calendar } from '@openshock/svelte-core/components/ui/calendar';
  import * as Popover from '@openshock/svelte-core/components/ui/popover';
  import { cn } from '@openshock/svelte-core/utils';

  interface Props {
    value: DateValue | undefined;
  }

  let { value = $bindable() }: Props = $props();

  const df = new DateFormatter(intlLocale(), {
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
    {value ? df.format(value.toDate(getLocalTimeZone())) : m.date_picker_placeholder()}
  </Popover.Trigger>
  <Popover.Content bind:ref={contentRef} class="w-auto p-0">
    <Calendar type="single" bind:value />
  </Popover.Content>
</Popover.Root>
