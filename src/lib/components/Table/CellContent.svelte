<script lang="ts">
  import { twTextColor, type TwTextColor } from '@openshock/svelte-core/types';
  import { cn } from '@openshock/svelte-core/utils';

  interface Props {
    text: string;
    bold?: true;
    title?: string;
    color?: TwTextColor;
    // Renders the cell as a link to this (already resolved) path.
    href?: string;
  }

  let { text, bold, title, color, href }: Props = $props();
</script>

<div
  class={cn('text-xs sm:text-sm', color ? twTextColor[color] : undefined)}
  class:font-medium={bold}
  {title}
>
  {#if href}
    <a {href} class="text-primary hover:underline">{text}</a>
  {:else}
    {text}
  {/if}
</div>
