<script lang="ts" generics="T extends { value: string; label: string }">
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { type Snippet } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
    import { LoaderCircle } from '@lucide/svelte';

	const id = $props.id();

	let {
		selected = $bindable([] as string[]),
		options,
		selectText,
		placeholder,
		noMatchText,
		disabled,
		label,
		loading,
		item
	}: {
		selected: string[];
		options: T[];
		selectText?: string;
		placeholder: string;
		noMatchText: string;
		disabled?: boolean;
		label?: string;
		loading?: boolean;
		item?: Snippet<[T]>;
	} = $props();
	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);
</script>

<div class="flex w-full flex-col ">
	<Label for="{id}-combo" class="mb-2 px-1">{label}</Label>
	<Popover.Root bind:open>
		<Popover.Trigger id="{id}-combo" bind:ref={triggerRef}>
			{#snippet child({ props })}
				<Button
					variant="outline"
					{...props}
					class="justify-between"
					role="combobox"
					aria-expanded={open}
					{disabled}
				>
				<span class="overflow-hidden">
					{options
						.filter((o) => selected.includes(o.value))
						.map((o) => o.label)
						.join(', ') ||
						selectText ||
						placeholder}
					</span>
					{#if loading}
						<LoaderCircle class="size-4 shrink-0 opacity-50 animate-spin" />
					{:else}
						<ChevronsUpDownIcon class="size-4 shrink-0 opacity-50" />
					{/if}
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="p-0">
			<Command.Root>
				<Command.Input {placeholder} />
				<Command.List>
					<Command.Empty>{noMatchText}</Command.Empty>
					<Command.Group>
						{#each options as option}
							<Command.Item
								value={option.value}
								keywords={[option.value, option.label]}
								onSelect={() => {
									if (selected.includes(option.value)) {
										selected = selected.filter((v) => v !== option.value);
									} else {
										selected.push(option.value);
									}
								}}
							>
								<Checkbox checked={selected.includes(option.value)} class="mr-2" />
								{#if item}
									{@render item(option)}
								{:else}
									{option.label}
								{/if}
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</div>
