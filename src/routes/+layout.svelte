<script lang="ts">
	import '../app.postcss';
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import {
		AppShell,
		Modal,
		Toast,
		getToastStore,
		initializeStores,
		storePopup
	} from '@skeletonlabs/skeleton';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
	initializeStores();

	const toastStore = getToastStore();
</script>

<Modal />
<Toast position="bl" max={5} />

<AppShell>
	<Header slot="header" />
	<slot />
	<Footer slot="pageFooter" />
</AppShell>
