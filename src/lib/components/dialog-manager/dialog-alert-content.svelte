<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import type { AlertProps } from './types';

  let { title, desc, buttonText = 'OK', resolve }: AlertProps = $props();

  function handleAcknowledge() {
    resolve();
  }
</script>

<Dialog.Header>
  <Dialog.Title>{title}</Dialog.Title>
  {#if desc}
    <Dialog.Description>{desc}</Dialog.Description>
  {/if}
</Dialog.Header>
<Dialog.Footer>
  <Button onclick={handleAcknowledge}>{buttonText}</Button>
</Dialog.Footer>
