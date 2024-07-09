<script lang="ts">
  import { PermissionType } from '$lib/api/internal/v1';
  import type { SvelteComponent } from 'svelte';

  export let parent: SvelteComponent;

  // Form Data
  const formData = {
    name: 'Jane Doe',
    expire: null as Date | null,
    permissions: [],
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
      <span>Expire</span>
      <input class="input" type="tel" bind:value={formData.expire} placeholder="Enter expire..." />
    </label>
    <label class="label">
      <span>Permissions</span>
      {#each Object.values(PermissionType).filter((v) => v !== PermissionType.unknownDefaultOpenApi) as name}
        <label>
          <input type="checkbox" value={name} bind:group={formData.permissions} />
          {name}
        </label>
      {/each}
    </label>
  </form>
  <!-- prettier-ignore -->
  <footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
			<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Submit Form</button>
		</footer>
</div>
