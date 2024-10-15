<script lang="ts">
  import { tokensApi } from '$lib/api';
  import { PermissionType } from '$lib/api/internal/v1';
  import TextInput from '$lib/components/TextInput.svelte';
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import type { SvelteComponent } from 'svelte';


  export let parent: SvelteComponent;
  const modalStore = getModalStore();

  let name = '';
  let permissionsActually: PermissionType[] = [];

  async function onFormSubmit() {
    try {
      await tokensApi.tokensEditToken($modalStore[0].meta.id, {
        name,
        permissions: permissionsActually
      });
    } catch (e) {
      console.error(e);
    }
    
    parent.onClose();

    const firstModal = $modalStore[0];
    if (firstModal && firstModal.component === 'ApiTokenEdit' && firstModal.response) {
        firstModal.response(true);
    }
  }

  type PermissionCategory = {
    name: string;
    perms: { name: string; key: string }[];
  };

  const permissions = Object.values(PermissionType)
    .filter((v) => v !== PermissionType.unknownDefaultOpenApi)
    .reduce((acc: PermissionCategory[], v) => {
      const [category, perm] = v.split('.');
      const cat = acc.find((c) => c.name === category);
      if (cat) {
        cat.perms.push({ name: perm, key: v });
      } else {
        acc.push({ name: category, perms: [{ name: perm, key: v }] });
      }
      return acc;
    }, []);

  function nameValidation(name: string): ValidationResult {
    if (name.length === 0) {
      return { valid: false, message: 'Name is required' };
    }

    if (name.length > 64) {
      return { valid: false, message: 'Name is too long' };
    }

    return { valid: true };
  }

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  async function getTokenData(tokenId: string) {
    try {
      const response = await tokensApi.tokensGetTokenById(tokenId);
      if(!response) {
        // TODO: Handle error
        console.error(response);
        return;
      }

      name = response.name!;
      permissionsActually = response.permissions!;

    } catch (e) {
      // TODO: Handle error
      console.error(e);
    }

  }

  getTokenData($modalStore[0].meta.id);

  $: nameValidationResult = nameValidation(name);

</script>

<div class="card p-4 w-modal shadow-xl space-y-4">
  <header class="text-2xl font-bold">Generate a new API Token</header>

  <form class="modal-form border border-surface-500 p-4 space-y-4 rounded-container-token">
    <TextInput
      label="Token Name"
      placeholder="Enter a Token name... e.g. ShockOSC"
      bind:value={name}
      validationResult={nameValidationResult}
    />

    <div>
      <h2>Permissions</h2>
      <div class="border rounded-md border-surface-500 p-4 space-y-4">
        {#each permissions as permission}
          <span>{capitalizeFirstLetter(permission.name)}</span>
          {#each permission.perms as perm}
            <label class="!mt-0 ml-4">
              <input
                type="checkbox"
                class="checkbox"
                value={perm.key}
                bind:group={permissionsActually}
              />
              {capitalizeFirstLetter(perm.name)}
            </label>
          {/each}
        {/each}
      </div>
    </div>
  </form>
  <!-- prettier-ignore -->
  <footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
			<button class="btn variant-filled-primary {parent.buttonPositive}"
       disabled={!nameValidationResult.valid} on:click={onFormSubmit}>Save Changes</button>
		</footer>
</div>
