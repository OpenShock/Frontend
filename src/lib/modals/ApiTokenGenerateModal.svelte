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
  let expire = 'never';
  let expireCustom: Date | null = null;
  let permissionsActually: PermissionType[] = [PermissionType.shockersUse];

  function getExpireDate(expireType: string, customExpireDate: Date | null): Date | null {
    switch (expireType) {
      case 'never':
        return null;
      case '7days':
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      case '30days':
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      case '60days':
        return new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      case '90days':
        return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      case 'custom':
        return customExpireDate;
    }
    return null;
  }

  async function onFormSubmit() {
    const expireDate = getExpireDate(expire, expireCustom);

    const valid = expireDate == null ? undefined : expireDate;

    try {
      const res = await tokensApi.tokensCreateToken({
        name,
        validUntil: valid,
        permissions: permissionsActually,
      });

      modalStore.trigger({
        type: 'component',
        meta: { token: res.data },
        component: 'ApiTokenDisplayGenerated'
      });
    } catch (e) {
      console.error(e);
    }
    
    parent.onClose();

    const firstModal = $modalStore[0];
    if (firstModal && firstModal.component === 'ApiTokenGenerate' && firstModal.response) {
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

  function expireValidation(expire: string, expireCustom: Date | null): ValidationResult {
    if (expire === 'custom' && !expireCustom) {
      return { valid: false, message: 'Expire date is required' };
    }

    return { valid: true };
  }

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  $: nameValidationResult = nameValidation(name);
  $: expireValidationResult = expireValidation(expire, expireCustom);
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

    <label class="label">
      <span>Expiration</span>
      <div class="flex items-center gap-3">
        <select class="select w-1/2" bind:value={expire}>
          <option value="never">Never</option>
          <option value="7days">7 days</option>
          <option value="30days">30 days</option>
          <option value="60days">60 days</option>
          <option value="90days">90 days</option>
          <option value="custom">Custom...</option>
        </select>

        {#if expire === 'custom'}
          <input class="input w-1/2" type="datetime-local" bind:value={expireCustom} />
        {:else if expire !== 'never'}
          <p>Expire on {getExpireDate(expire, expireCustom)?.toLocaleString()}</p>
        {:else}
          <p>The token will never expire</p>
        {/if}
      </div>
      {#if expireValidationResult.valid}
        <div class="h-3" />
      {:else}
        <p class="text-xs text-red-500 !mt-0">{expireValidationResult.message}</p>
      {/if}
    </label>

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
       disabled={!nameValidationResult.valid || !expireValidationResult.valid} on:click={onFormSubmit}>Generate</button>
		</footer>
</div>
