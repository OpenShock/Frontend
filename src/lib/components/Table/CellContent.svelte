<script lang="ts">
  import { twTextColor, type TwTextColor } from '$core/types/Tailwind';
  import { cn } from '$core/utils/shadcn';

  interface Props {
    text: string;
    bold?: true;
    title?: string;
    color?: TwTextColor;
  }

  let { text, bold, title, color }: Props = $props();
</script>

<div
  class={cn('text-xs sm:text-sm', color ? twTextColor[color] : undefined)}
  class:font-medium={bold}
  {title}
>
  {text}
</div>
