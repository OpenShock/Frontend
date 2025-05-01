<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { CircleCheckBig, Copy } from "@lucide/svelte";
	import type { Snippet } from "svelte";
	import { toast } from 'svelte-sonner';
  	import { fade, scale } from "svelte/transition";

	type Props = {
		value: string,
		class?: string,
		icon?: Snippet
	};

	let {
		value,
		class: className,
		icon
	}: Props = $props();

	let copied = $state(false);

	function copyToken() {
		if (value == null) return;
		navigator.clipboard.writeText(value);
		copied = true;
		toast.success('Copied to clipboard');
	}
</script>

<style>
	.no-outline {
		outline: none !important;
	}
</style>

<form class={cn(
	"flex flex-row border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-md border px-3 py-2 text-base focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
	className
)}>
	{#if icon}
		{@render icon()}
	{/if}
	<input
	    class="no-outline grow mx-3"
		type="text"
		bind:value
		readonly
		disabled
	/>
	<span>
	
		<button onclick={copyToken} class="transition-in-place">
			{#if copied}
				<span transition:scale>
					<CircleCheckBig size="20" />
				</span>
			{:else}
				<span transition:scale>
					<Copy size="20" />
				</span>
			{/if}

		</button>
	</span>
</form>