<script lang="ts">
	import { UserStore } from '$lib/stores/UserStore';
	import { AppBar, LightSwitch } from '@skeletonlabs/skeleton';
</script>

<AppBar slot="header">
	<div slot="lead" class="flex items-center space-x-4">
		<!-- Logo -->
		<a
			href="/"
			class="overflow-hidden lg:!ml-0 lg:w-auto select-none"
			data-sveltekit-preload-data="hover"
		>
			<img class="inline-block h-12 pointer-events-none" src="/logo.svg" alt="OpenShock Logo" />
		</a>
	</div>
	<svelte:fragment slot="trail">
		<LightSwitch />
		{#if !!$UserStore}
			<a
				href="/dashboard"
				class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
			>
				Dashboard
			</a>
		{:else}
			<a
				href="/login"
				class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
			>
				Login
			</a>
			<a
				href="/register"
				class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
			>
				Register
			</a>
		{/if}
	</svelte:fragment>
</AppBar>
