<script lang="ts">
  import Link2 from '@lucide/svelte/icons/link-2';
  import { Button } from '$lib/components/ui/button';

  interface Props {
    label: string;
    providerKey: string;
    onLink: (providerKey: string) => void;
    loading?: boolean;
  }

  let { label, providerKey, onLink, loading = false }: Props = $props();
</script>

<Button onclick={() => onLink(providerKey)} disabled={loading} aria-busy={loading}>
  <Link2 class="mr-2 size-4" />
  {loading ? `Starting ${label}...` : `Link ${label}`}
</Button>
