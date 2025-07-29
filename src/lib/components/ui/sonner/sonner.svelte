<script lang="ts">
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from "svelte-sonner";
	import { colorScheme } from '$lib/stores/ColorSchemeStore.svelte';

	let { ...restProps }: SonnerProps = $props();
</script>

<Sonner
	theme={colorScheme.Value}
	class="toaster group"
	style="--normal-bg: var(--color-popover); --normal-text: var(--color-popover-foreground); --normal-border: var(--color-border);"
	{...restProps}
/>
