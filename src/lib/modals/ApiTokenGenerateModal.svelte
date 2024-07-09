<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  export let parent: SvelteComponent;

  	// Form Data
	const formData = {
		name: 'Jane Doe',
		expire: null,
		permissions: []
	};


	function onFormSubmit(): void {
		parent.close();
	}

</script>

<div class="card p-4 w-modal shadow-xl space-y-4">
    <header class="text-2xl font-bold">Generate a new API Token</header>

    <form class="modal-form border border-surface-500 p-4 space-y-4 rounded-container-token">
			<label class="label">
				<span>Name</span>
				<input class="input" type="text" bind:value={formData.name} placeholder="Enter name..." />
			</label>
			<label class="label">
				<span>Phone Number</span>
				<input class="input" type="tel" bind:value={formData.tel} placeholder="Enter phone..." />
			</label>
			<label class="label">
				<span>Email</span>
				<input class="input" type="email" bind:value={formData.email} placeholder="Enter email address..." />
			</label>
		</form>
		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
			<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Submit Form</button>
		</footer>
</div>
